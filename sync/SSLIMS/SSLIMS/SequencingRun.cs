using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Threading.Tasks;

namespace SSLIMS
{
    class SequencingRun
    {

        private Properties.Settings settings = Properties.Settings.Default;
        private API api;

        public string Path { get; set; }
        public string Name { get; set; }
        public List<string> Files = new List<string>();
        public EventHandler FileUploaded;

        public SequencingRun(string path, API apiClient)
        {
            this.Path = path;
            this.Name = (new DirectoryInfo(path)).Name;
            this.api = apiClient;

            findFiles();
        }

        private void findFiles()
        {
            try
            {
                string[] files = Directory.GetFiles(this.Path);

                foreach (string file in files)
                {
                    string ext = System.IO.Path.GetExtension(file);

                    if (ext == ".ab1") Files.Add(file);
                }
            }
            catch
            {
               
            }
        }

        public bool isUploaded()
        {
            return settings.completedRuns.Contains(this.Path);
        }

        public async Task<bool> upload()
        {
            foreach (var f in this.Files)
            {
                var uploadSuccess = await api.uploadAb1(f);

                if (!uploadSuccess) return false;

                if ( this.FileUploaded != null ) this.FileUploaded.Invoke(this, new EventArgs());
            }

            return true;
        }

        public static bool isValidRunDirectory(string path)
        {
            try
            {
                string[] files = Directory.GetFiles(path);

                foreach (string file in files)
                {
                    string ext = System.IO.Path.GetExtension(file);

                    if (ext == ".ab1" || ext == ".seq") return true;
                }
            }
            catch
            {
                return false;
            }

            return false;
        }
    }
}
