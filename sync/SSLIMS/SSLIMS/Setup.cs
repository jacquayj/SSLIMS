using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;

namespace SSLIMS
{
    public partial class Setup : Form
    {
        private API api;
        private Properties.Settings settings = Properties.Settings.Default;

        public Setup(API apiClient)
        {
            api = apiClient;

            InitializeComponent();

            populateClientCombo();
            
        }

        private void populateClientCombo()
        {

        }

        private void existingClientRadio_CheckedChanged(object sender, EventArgs e)
        {
            RadioButton r = (RadioButton)sender;

            if (r.Checked)
            {
                clientChoiceCombo.Visible = true;
                clientChoiceLabel.Visible = true;
                clientNewNameLabel.Visible = false;
                clientNewText.Visible = false;
            }
            else
            {
                clientChoiceCombo.Visible = false;
                clientChoiceLabel.Visible = false;
                clientNewNameLabel.Visible = true;
                clientNewText.Visible = true;
            }
        }

        private void showBrowseDialog()
        {
            runDirectoryDialog.SelectedPath = runDirectoryText.Text;

            if ( runDirectoryDialog.ShowDialog() == DialogResult.OK )
            {
                if ( isValidRunDirectory(runDirectoryDialog.SelectedPath) )
                {
                    runDirectoryText.Text = runDirectoryDialog.SelectedPath;
                }
                else
                {
                    MessageBox.Show("The path you have selected doesn't appear to be a valid instrument run directory.");
                }
            }
        }

        private void runDirectoryBrowseBtn_Click(object sender, EventArgs e)
        {
            showBrowseDialog();
        }

        private void runDirectoryText_Click(object sender, EventArgs e)
        {
            showBrowseDialog();
        }

        private void exitAppBtn_Click(object sender, EventArgs e)
        {
            Application.Exit();
        }

        private bool isValidRunDirectory(string path)
        {
            try
            {
                string[] folders = System.IO.Directory.GetDirectories(path, "*", System.IO.SearchOption.AllDirectories);
                if ( folders.Length > 0 )
                {
                    foreach ( string runDir in folders )
                    {
                        string[] files = Directory.GetFiles(runDir);

                        foreach ( string file in files )
                        {
                            string ext = Path.GetExtension(file);

                            if (ext == ".ab1" || ext == ".seq") return true;
                        }
                    }
                   // string runDir = folders[0];
                   

                }
            }
            catch 
            {
                return false;
            }

            return false;
        }

        private async void saveSettingsBtn_Click(object sender, EventArgs e)
        {
            if (isValidRunDirectory(runDirectoryText.Text))
            {
                if ( newClientRadio.Checked )
                {
                    if (clientNewText.Text.Trim() != "")
                    {
                        api.clientName = clientNewText.Text.Trim();

                        var registrationSuccess = await api.registerClient();

                        if (registrationSuccess)
                        {
                            settings.clientName = api.clientName;
                            settings.runDirectoryPath = runDirectoryText.Text;
                            settings.Save();

                            Hide();
                            (new MainForm(api)).Show();
                        }
                        else
                        {
                            MessageBox.Show("There was an error while registering this client with the API. Please contact support.");
                        }
                    }
                    else
                    {
                        MessageBox.Show("Please provide a name for this instrument.");
                    }
                }
            }
            else
            {
                MessageBox.Show("The path you have selected doesn't appear to be a valid instrument run directory.");
            }
            
        }

    }
}
