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
using System.Media;
using System.Diagnostics;


namespace SSLIMS
{
    public partial class MainForm : Form
    {
        private Properties.Settings settings = Properties.Settings.Default;

        private API api;
        private Logger log = new Logger("SSLIMS", "Application");
        private Form preferences;

        FileSystemWatcher watcher = new FileSystemWatcher();

        private bool shouldExit = false;
        private bool cancelUpload = false;
        private bool readyForUpload = false;

        private int runFileCount;
        private float runFileIndex;

        private BindingList<SequencingRun> cRuns = new BindingList<SequencingRun>();
        private BindingList<SequencingRun> qRuns = new BindingList<SequencingRun>();

        public MainForm(API apiClient)
        {
            api = apiClient;
            InitializeComponent();

            setupForm();
        }

        private void populateRuns()
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new MethodInvoker(this.populateRuns));
                return;
            }

            cRuns.Clear();
            qRuns.Clear();

            string[] folders = System.IO.Directory.GetDirectories(settings.runDirectoryPath, "*", System.IO.SearchOption.AllDirectories);

            foreach ( string f in folders )
            {
                if (SequencingRun.isValidRunDirectory(f))
                {
                    var run = new SequencingRun(f, api);
                   
                    if ( run.isUploaded() )
                    {
                        cRuns.Add(run);
                    }
                    else
                    {
                        qRuns.Add(run);
                    }
                }
            }

        }

        private void startFSListener()
        {
            watcher.Path = settings.runDirectoryPath;
            watcher.NotifyFilter = NotifyFilters.LastAccess | NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.DirectoryName;

            watcher.Changed += new FileSystemEventHandler(fileSystemModified);
            watcher.Created += new FileSystemEventHandler(fileSystemCreated);
            watcher.Deleted += new FileSystemEventHandler(fileSystemModified);
            watcher.Renamed += new RenamedEventHandler(fileSystemModified);

            watcher.EnableRaisingEvents = true;
        }

        private void fileSystemCreated(object source, FileSystemEventArgs e)
        {
            var attrs = File.GetAttributes(e.FullPath);

            if (attrs.HasFlag(FileAttributes.Directory))
            {
                populateRuns();

                if (settings.autoUploadRuns && startUploadBtn.Enabled)
                {
                    startUploadBtn_Click("FSListener", new EventArgs());
                }

            }

        }

        private void fileSystemModified(object source, FileSystemEventArgs e)
        {
            try
            {
                var attrs = File.GetAttributes(e.FullPath);

                if (attrs.HasFlag(FileAttributes.Directory))
                {
                    populateRuns();
                }
            }
            catch (System.IO.FileNotFoundException er)
            {
                populateRuns();
            }
            
           
        }

        public async void setupForm()
        {
            if (settings.completedRuns == null)
            {
                settings.completedRuns = new System.Collections.Specialized.StringCollection();
                settings.Save();
            }

            completeRunList.DataSource = cRuns;
            queuedRunList.DataSource = qRuns;

            clientName.Text = settings.clientName;
            runDirectory.Text = settings.runDirectoryPath;

            try
            {
                populateRuns();
                startFSListener();
            }
            catch (System.IO.DirectoryNotFoundException e)
            {
                MessageBox.Show("Run directory " + settings.runDirectoryPath + " not found. The preferences form will appear after you click O.K. to reconfigure.");
                showPrefDialog();
            }

            var enabled = await api.isClientEnabled();

            if (enabled)
            {
                enableControls();
                
                if (settings.autoUploadRuns)
                {
                    startUploadBtn_Click(this, new EventArgs());
                }
            }
            else
            {
                statusLabel.Text = "Waiting for administrator to activate client";
                disableControls();
                checkActivationTimer.Enabled = true;
            }
        }

        private async void checkActivationTimer_Tick(object sender, EventArgs e)
        {
            var enabled = await api.isClientEnabled();

            if ( enabled )
            {
                statusLabel.Text = "Waiting";
                checkActivationTimer.Enabled = false;
                enableControls();
                readyForUpload = true;
            }
        }

        private void enableControls()
        {
            queuedRunList.Enabled = true;
            completeRunList.Enabled = true;
            startUploadBtn.Enabled = true;

            stopUploadBtn.Enabled = false;
        }

        private void disableControls()
        {
            queuedRunList.Enabled = false;
            completeRunList.Enabled = false;
            startUploadBtn.Enabled = false;

            stopUploadBtn.Enabled = true;
        }

        // Starts in task bar
        protected override void OnLoad(EventArgs e)
        {
            if (settings.minimizeToTrayOnStartup) hideForm();

            base.OnLoad(e);
        }

        private async void button1_Click(object sender, EventArgs e)
        {

            //api.clientName = clientName.Text;

            //var registered = await api.isClientRegistered();

            //if (!registered)
            //{
            //    MessageBox.Show("Client not registered with API, sending registration request.");
            //    await api.registerClient();
            //}

            //var enabled = await api.isClientEnabled();

            //if (enabled)
            //{
            //    await api.uploadAb1(@"C:\Users\jacquayj\Desktop\test.ab1");
            //}
            //else
            //{
            //    MessageBox.Show("Client is not enabled");
            //}
            
            //clientName.Text = api.clientName;
           
        }

        // When the close button is pressed, hide the form instead of killing app
        private void SSLIMS_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (!shouldExit)
            {
                e.Cancel = true;
                hideForm();
            }
            
        }

        private void trayIcon_MouseClick(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                showForm();
            }
            else if (e.Button == MouseButtons.Right)
            {
                taskbarContextMenu.Show();
            }
            
        }

        private void showForm()
        {
            Show();
            ShowInTaskbar = true;
            if (WindowState != FormWindowState.Normal) WindowState = FormWindowState.Normal;
            Activate();
        }

        private void hideForm()
        {
            Hide();
            ShowInTaskbar = false;
        }

        private void preferencesBtn_Click(object sender, EventArgs e)
        {
            showPrefDialog();
        }

        private void preferencesToolStripMenuItem_Click(object sender, EventArgs e)
        {
            showPrefDialog();
        }

        private void showPrefDialog()
        {
            preferences = new Preferences(this);
            preferences.ShowDialog(this);
        }

        private void exitMenuItem_Click(object sender, EventArgs e)
        {
            closeApp();
        }

        private void exitToolStripMenuItem_Click(object sender, EventArgs e)
        {
            closeApp();
        }
 
        private void closeApp()
        {
            shouldExit = true;
            Application.Exit();
        }

        private void resetApplicationDataPreferencesToolStripMenuItem_Click(object sender, EventArgs e)
        {
            var confirmResult = MessageBox.Show("Are you sure you want to clear all client data and preferences? This action will require you to reconfigure your client.", "Clear Client Data?", MessageBoxButtons.YesNo);
            if (confirmResult == DialogResult.Yes)
            {
                Properties.Settings.Default.Reset();
            }
           
        }

        private void File_Uploaded(object sender, System.EventArgs e)
        {

            runProgressBar.Value = (int)((runFileIndex / runFileCount) * 100);

            runFileIndex++;
        }

        private async void startUploadBtn_Click(object sender, EventArgs e)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new MethodInvoker(() => this.startUploadBtn_Click(sender, e)));
                return;
            }

            if (settings.autoUploadRuns && sender.ToString() != "FSListener") MessageBox.Show("Run auto upload initiated, will upload all runs in queue.");

            if (queuedRunList.SelectedItems.Count != 0 || settings.autoUploadRuns)
            {
                disableControls();
                watcher.EnableRaisingEvents = false;

                statusLabel.Text = "Uploading Runs";

                List<SequencingRun> selectedList;

                if (settings.autoUploadRuns)
                {
                    selectedList = queuedRunList.Items.Cast<SequencingRun>().ToList();
                }
                else
                {
                    selectedList = queuedRunList.SelectedItems.Cast<SequencingRun>().ToList();
                }
                

                float index = 1;
                foreach (var r in selectedList)
                {
                    if (cancelUpload)
                    {
                        cancelUpload = false;
                        runProgressBar.Value = 100;
                        totalProgressBar.Value = 100;
                        break;
                    }

                    currentRunText.Text = r.Name;

                    r.FileUploaded = new System.EventHandler(this.File_Uploaded);

                    runFileCount = r.Files.Count;
                    runFileIndex = 1;

                    
                    var uploadSuccess = await r.upload();

                    if (!uploadSuccess)
                    {
                        runProgressBar.Value = 0;
                        totalProgressBar.Value = 0;
                        MessageBox.Show("AB1 upload failed, please contact support.");
                        break;
                    }

                    totalProgressBar.Value = (int)((index / selectedList.Count) * 100);

                    index++;

                    qRuns.Remove(r);
                    settings.completedRuns.Add(r.Path);
                    settings.Save();
                    cRuns.Add(r);
                   
                }

                
                enableControls();

                watcher.EnableRaisingEvents = true;
                populateRuns();

                statusLabel.Text = "Waiting";
                currentRunText.Text = "None";

              
            }
            else
            {
                MessageBox.Show("Please select at least one run to upload.");
            }
            
        }

        private void stopUploadBtn_Click(object sender, EventArgs e)
        {
            statusLabel.Text = "Canceling Upload";
            cancelUpload = true;
        }

        private void completeRunList_MouseUp(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Right)
            {
                completedRunContextMenu.Show();
            }
        }

        private void requeueItem_Click(object sender, EventArgs e)
        {
            foreach ( SequencingRun run in completeRunList.SelectedItems )
            {
                settings.completedRuns.Remove(run.Path);
            }

            settings.Save();
            populateRuns();
        }

        private void aboutToolStripMenuItem_Click(object sender, EventArgs e)
        {
            About about = new About(this);

            about.ShowDialog(this);
        }

        private void downloadPltBtn_Click(object sender, EventArgs e)
        {
            DownloadPlate downloadPlate = new DownloadPlate(this, api);

            downloadPlate.ShowDialog(this);

        }

        private void downloadpltFileToolStripMenuItem_Click(object sender, EventArgs e)
        {
            DownloadPlate downloadPlate = new DownloadPlate(this, api);

            downloadPlate.ShowDialog(this);
        }

    
       
    }
}
