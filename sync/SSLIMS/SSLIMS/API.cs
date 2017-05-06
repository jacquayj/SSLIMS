using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using System.Web.Helpers;
using System.Windows.Forms;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Web;

namespace SSLIMS
{

    class APIResponse
    {
        public JObject body;
        public string bodyString;
        public System.Net.HttpStatusCode responseCode;
    }

    class APIUrlParam
    {
        public string name;
        public object value;
    }

    public class API
    {
        private const string apiHost = "api.ci-sslims-0.icbr.local";
        private const string apiVersion = "1.0";

        public String clientName;
        private Properties.Settings settings = Properties.Settings.Default;

        public API()
        {

        }

        private static bool AcceptAllCertifications(object sender, System.Security.Cryptography.X509Certificates.X509Certificate certification, System.Security.Cryptography.X509Certificates.X509Chain chain, System.Net.Security.SslPolicyErrors sslPolicyErrors)
        {
            return true;
        }

        private static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        // Accepts resource URL (content after /v1.0/), request type and payload
        private async Task<APIResponse> apiRequest(string resourceURI, HttpMethod type, Object payload = null, List<APIUrlParam> urlParams = null)
        {
            String uriString = "https://" + apiHost + "/v" + apiVersion + "/" + resourceURI;
           
            var urlVars = "";

            if ( !String.IsNullOrEmpty(settings.clientKey) )
            {
                urlVars += ("auth=" + settings.clientKey + "&");
            }

            if (urlParams != null)
            {
                foreach (var p in urlParams)
                {
                    if (p.name == "query")
                    {
                        urlVars += (p.name + "=" + HttpUtility.UrlEncode(Base64Encode(JsonConvert.SerializeObject(p.value))) + "&");
                    }
                    else
                    {
                        urlVars += (p.name + "=" + p.value.ToString() + "&");
                    }
                }
            }

            urlVars.TrimEnd('&');

            Uri uri = new Uri("https://" + apiHost + "/v" + apiVersion + "/" + resourceURI + (String.IsNullOrEmpty(urlVars) ? "" : ("?" + urlVars)));

            System.Net.ServicePointManager.ServerCertificateValidationCallback = new System.Net.Security.RemoteCertificateValidationCallback(AcceptAllCertifications);

            HttpRequestMessage request = new HttpRequestMessage(type, uri);
            HttpClient client = new HttpClient();

            if (payload != null)
            {
                request.Content = new StringContent(JsonConvert.SerializeObject(payload));
            }
            

            HttpResponseMessage response = await client.SendAsync(request);

            string responseString = await response.Content.ReadAsStringAsync();

            try
            {
                return new APIResponse
                {
                    body = JObject.Parse(responseString),
                    responseCode = response.StatusCode
                };
            }
            catch (JsonReaderException er)
            {
                return new APIResponse
                {
                    bodyString = responseString,
                    responseCode = response.StatusCode
                };
            }

        }


        // Need a way to pass URL params like query, page, etc...
        //public string[] getClientList()
        //{
        //    apiRequest('users')
        //}

        public async Task<bool> isClientRegistered()
        {
            if (String.IsNullOrEmpty(settings.clientID)) return false;

            var response = await apiRequest("users/" + settings.clientID, HttpMethod.Get);

            // Delete settings if we recieve an unauthorized, it means the client has been deleted
            if (response.responseCode == System.Net.HttpStatusCode.Unauthorized)
            {
                resetSettings();
                return false;
            }
                

            return true;
        }

        public void resetSettings()
        {
            settings.clientID = (string)settings.Properties["clientID"].DefaultValue;
            settings.clientKey = (string)settings.Properties["clientKey"].DefaultValue;
            settings.Save();
        }

        public async Task<bool> isClientEnabled()
        {
           if (String.IsNullOrEmpty(settings.clientID)) return false;

            var response = await apiRequest("users/" + settings.clientID, HttpMethod.Get);

            // Delete settings if we recieve an unauthorized, it means the client has been deleted
            if (response.responseCode == System.Net.HttpStatusCode.Unauthorized)
            {
                resetSettings();
                return false;
            }

            JObject user = (JObject)response.body.SelectToken("result").SelectToken("data");

            clientName = user.Property("name").Value.ToString();

            if (user.Property("status").Value.ToString() == "active") return true;

            return false;
        }

        public async Task<bool> registerClient()
        {
            var registered = await isClientRegistered();

            if (!registered)
            {
                 var response = await apiRequest("users", HttpMethod.Post, new { 
                    name = clientName,
                    user_type = "data_client",
                    status = "disabled"
                });

                if ((int)response.body.Property("error").Value == 1)
                {
                    MessageBox.Show("Error: " + response.body.Property("error_message").Value.ToString());
                    return false;
                }

                JObject user = (JObject)response.body.SelectToken("result").SelectToken("data");

                settings.clientID = user.Property("id").Value.ToString();
                settings.clientKey = user.Property("client_api_key").Value.ToString();
                settings.Save();

                return true;
            }

            return false;
        }

        public async Task<JArray> getReadyPlates()
        {
            var response = await apiRequest("sheets", HttpMethod.Get, null, new List<APIUrlParam> {
                new APIUrlParam() {
                    name = "query",
                    value = new {
                        status = "Waiting to be sequenced"
                    }
                },
                new APIUrlParam() {
                    name = "limit",
                    value = 1000
                }
            });

            return (JArray)response.body.SelectToken("result").SelectToken("data");
        }

        public async Task<string> getPlateFile(string id)
        {
            var urlParams = new List<APIUrlParam>();
            urlParams.Add(new APIUrlParam { name = "client", value = "cs" });
            var response = await apiRequest("files/" + id, HttpMethod.Get, null, urlParams);

            return response.bodyString;
        }

        public async Task<bool> uploadAb1(string filePath)
        {
            byte[] fileBytes = File.ReadAllBytes(filePath);
            string b64File = Convert.ToBase64String(fileBytes);

            var response = await apiRequest("files", HttpMethod.Post, new {
                action = new {
	                method = "upload_chromatogram",
	                paramz = new {
		                file_name = Path.GetFileName(filePath),
		                ab1_data = b64File
	                }
                },
                mime = "application/octet-stream"
            });

            if ((int)response.body.Property("error").Value == 1) return false;

            return true;
        }

    }
}
