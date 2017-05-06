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
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SSLIMS
{
    public partial class DownloadPlate : Form
    {
        private MainForm parent;
        private Properties.Settings settings = Properties.Settings.Default;
        private API api;
        private JArray sheets;

        public DownloadPlate(MainForm p, API a)
        {
            api = a;
            parent = p;
            InitializeComponent();

            savePltFileDialog.DefaultExt = "plt";
            savePltFileDialog.Filter = "Plate File (*.plt)|*.plt|All files (*.*)|*.*";

            populateUI();
        }

        private async void populateUI()
        { 
            sheets = await api.getReadyPlates();
            
            foreach (var sheet in sheets)
            {
                plateListBox.Items.Add(sheet.Value<string>("id2") + "_" + sheet.Value<string>("name") + " - " + sheet.Value<string>("plt_file"));
            }
        }

        private void Preferences_FormClosing(object sender, FormClosingEventArgs e)
        {
            parent.Focus();
        }

        private void cancelBtn_Click(object sender, EventArgs e)
        {
            Close();
        }

        private string cleanFileName(string fileName)
        {
            foreach (char c in System.IO.Path.GetInvalidFileNameChars())
            {
                fileName = fileName.Replace(c, '-');
            }
            return fileName;
        }

        private void saveBtn_Click(object sender, EventArgs e)
        { 
            if (plateListBox.SelectedItems.Count > 0)
            {
                savePltFileDialog.FileName = cleanFileName(((string)plateListBox.SelectedItem).Split(new[] { " - " }, StringSplitOptions.None).First().Trim());
                DialogResult result = savePltFileDialog.ShowDialog(this);

                if (result == DialogResult.OK)
                {
                    savePltFile();
                }
            }
            else
            {
                MessageBox.Show("Please select a plate to download.");
            }
        }

        private async void savePltFile()
        {
            string fileContents = await api.getPlateFile(((string)plateListBox.SelectedItem).Split(new[] { " - " }, StringSplitOptions.None).Last().Trim());

            File.WriteAllText(savePltFileDialog.FileName, fileContents);

            Close();
        }


        
    }
}
