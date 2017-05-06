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
using System.Reflection;

namespace SSLIMS
{
    public partial class Preferences : Form
    {
        private Form parent;
        private Properties.Settings settings = Properties.Settings.Default;

        public Preferences(Form p)
        {
            parent = p;
            InitializeComponent();
            minimizeToTrayOnStartup.CheckState = (settings.minimizeToTrayOnStartup) ? CheckState.Checked : CheckState.Unchecked;
            autoUploadRunsChkBox.CheckState = (settings.autoUploadRuns) ? CheckState.Checked : CheckState.Unchecked;
            clientNameText.Text = settings.clientName;
            runDirectoryText.Text = settings.runDirectoryPath;
        }

        private void Preferences_FormClosing(object sender, FormClosingEventArgs e)
        {
            parent.Focus();
        }


        private void saveBtn_Click(object sender, EventArgs e)
        {
            settings.minimizeToTrayOnStartup = (minimizeToTrayOnStartup.CheckState == CheckState.Checked);
            settings.autoUploadRuns = (autoUploadRunsChkBox.CheckState == CheckState.Checked);
           
            settings.clientName = clientNameText.Text;
            // Need to update server here

            settings.runDirectoryPath = runDirectoryText.Text;

            settings.Save();
            Close();
        }



        
    }
}
