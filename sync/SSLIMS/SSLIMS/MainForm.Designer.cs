namespace SSLIMS
{
    partial class MainForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(MainForm));
            this.clientNameLabel = new System.Windows.Forms.Label();
            this.trayIcon = new System.Windows.Forms.NotifyIcon(this.components);
            this.taskbarContextMenu = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.exitMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.topMenuStrip = new System.Windows.Forms.MenuStrip();
            this.fileToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.downloadpltFileToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.exitToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.editToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.preferencesToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.helpToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.resetApplicationDataPreferencesToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.aboutToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.statusStrip = new System.Windows.Forms.StatusStrip();
            this.toolStripStatusLabel1 = new System.Windows.Forms.ToolStripStatusLabel();
            this.statusLabel = new System.Windows.Forms.ToolStripStatusLabel();
            this.queuedRunList = new System.Windows.Forms.ListBox();
            this.runProgressBar = new System.Windows.Forms.ProgressBar();
            this.preferencesBtn = new System.Windows.Forms.Button();
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            this.clientName = new System.Windows.Forms.Label();
            this.uploadedRunsLabel = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.runDirectoryLabel = new System.Windows.Forms.Label();
            this.runDirectory = new System.Windows.Forms.Label();
            this.completeRunList = new System.Windows.Forms.ListBox();
            this.completedRunContextMenu = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.requeueItem = new System.Windows.Forms.ToolStripMenuItem();
            this.totalProgressBar = new System.Windows.Forms.ProgressBar();
            this.label3 = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.hrLabel = new System.Windows.Forms.Label();
            this.label5 = new System.Windows.Forms.Label();
            this.label6 = new System.Windows.Forms.Label();
            this.currentRunText = new System.Windows.Forms.Label();
            this.label8 = new System.Windows.Forms.Label();
            this.label9 = new System.Windows.Forms.Label();
            this.startUploadBtn = new System.Windows.Forms.Button();
            this.stopUploadBtn = new System.Windows.Forms.Button();
            this.checkActivationTimer = new System.Windows.Forms.Timer(this.components);
            this.downloadPltBtn = new System.Windows.Forms.Button();
            this.taskbarContextMenu.SuspendLayout();
            this.topMenuStrip.SuspendLayout();
            this.statusStrip.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            this.completedRunContextMenu.SuspendLayout();
            this.SuspendLayout();
            // 
            // clientNameLabel
            // 
            this.clientNameLabel.AutoSize = true;
            this.clientNameLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 12F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.clientNameLabel.Location = new System.Drawing.Point(15, 28);
            this.clientNameLabel.Name = "clientNameLabel";
            this.clientNameLabel.Size = new System.Drawing.Size(111, 20);
            this.clientNameLabel.TabIndex = 3;
            this.clientNameLabel.Text = "Client Name:";
            // 
            // trayIcon
            // 
            this.trayIcon.ContextMenuStrip = this.taskbarContextMenu;
            this.trayIcon.Icon = ((System.Drawing.Icon)(resources.GetObject("trayIcon.Icon")));
            this.trayIcon.Text = "SSLIMS Client";
            this.trayIcon.Visible = true;
            this.trayIcon.MouseClick += new System.Windows.Forms.MouseEventHandler(this.trayIcon_MouseClick);
            // 
            // taskbarContextMenu
            // 
            this.taskbarContextMenu.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.exitMenuItem});
            this.taskbarContextMenu.Name = "taskbarContextMenu";
            this.taskbarContextMenu.Size = new System.Drawing.Size(93, 26);
            // 
            // exitMenuItem
            // 
            this.exitMenuItem.Name = "exitMenuItem";
            this.exitMenuItem.Size = new System.Drawing.Size(92, 22);
            this.exitMenuItem.Text = "Exit";
            this.exitMenuItem.Click += new System.EventHandler(this.exitMenuItem_Click);
            // 
            // topMenuStrip
            // 
            this.topMenuStrip.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.fileToolStripMenuItem,
            this.editToolStripMenuItem,
            this.helpToolStripMenuItem});
            this.topMenuStrip.Location = new System.Drawing.Point(0, 0);
            this.topMenuStrip.Name = "topMenuStrip";
            this.topMenuStrip.Size = new System.Drawing.Size(826, 24);
            this.topMenuStrip.TabIndex = 5;
            this.topMenuStrip.Text = "menuStrip1";
            // 
            // fileToolStripMenuItem
            // 
            this.fileToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.downloadpltFileToolStripMenuItem,
            this.exitToolStripMenuItem});
            this.fileToolStripMenuItem.Name = "fileToolStripMenuItem";
            this.fileToolStripMenuItem.Size = new System.Drawing.Size(37, 20);
            this.fileToolStripMenuItem.Text = "File";
            // 
            // downloadpltFileToolStripMenuItem
            // 
            this.downloadpltFileToolStripMenuItem.Name = "downloadpltFileToolStripMenuItem";
            this.downloadpltFileToolStripMenuItem.Size = new System.Drawing.Size(152, 22);
            this.downloadpltFileToolStripMenuItem.Text = "Download .plt";
            this.downloadpltFileToolStripMenuItem.Click += new System.EventHandler(this.downloadpltFileToolStripMenuItem_Click);
            // 
            // exitToolStripMenuItem
            // 
            this.exitToolStripMenuItem.Name = "exitToolStripMenuItem";
            this.exitToolStripMenuItem.Size = new System.Drawing.Size(152, 22);
            this.exitToolStripMenuItem.Text = "Exit";
            this.exitToolStripMenuItem.Click += new System.EventHandler(this.exitToolStripMenuItem_Click);
            // 
            // editToolStripMenuItem
            // 
            this.editToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.preferencesToolStripMenuItem});
            this.editToolStripMenuItem.Name = "editToolStripMenuItem";
            this.editToolStripMenuItem.Size = new System.Drawing.Size(39, 20);
            this.editToolStripMenuItem.Text = "Edit";
            // 
            // preferencesToolStripMenuItem
            // 
            this.preferencesToolStripMenuItem.Name = "preferencesToolStripMenuItem";
            this.preferencesToolStripMenuItem.Size = new System.Drawing.Size(135, 22);
            this.preferencesToolStripMenuItem.Text = "Preferences";
            this.preferencesToolStripMenuItem.Click += new System.EventHandler(this.preferencesToolStripMenuItem_Click);
            // 
            // helpToolStripMenuItem
            // 
            this.helpToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.resetApplicationDataPreferencesToolStripMenuItem,
            this.aboutToolStripMenuItem});
            this.helpToolStripMenuItem.Name = "helpToolStripMenuItem";
            this.helpToolStripMenuItem.Size = new System.Drawing.Size(44, 20);
            this.helpToolStripMenuItem.Text = "Help";
            // 
            // resetApplicationDataPreferencesToolStripMenuItem
            // 
            this.resetApplicationDataPreferencesToolStripMenuItem.Name = "resetApplicationDataPreferencesToolStripMenuItem";
            this.resetApplicationDataPreferencesToolStripMenuItem.Size = new System.Drawing.Size(163, 22);
            this.resetApplicationDataPreferencesToolStripMenuItem.Text = "Reset Client Data";
            this.resetApplicationDataPreferencesToolStripMenuItem.Click += new System.EventHandler(this.resetApplicationDataPreferencesToolStripMenuItem_Click);
            // 
            // aboutToolStripMenuItem
            // 
            this.aboutToolStripMenuItem.Name = "aboutToolStripMenuItem";
            this.aboutToolStripMenuItem.Size = new System.Drawing.Size(163, 22);
            this.aboutToolStripMenuItem.Text = "About";
            this.aboutToolStripMenuItem.Click += new System.EventHandler(this.aboutToolStripMenuItem_Click);
            // 
            // statusStrip
            // 
            this.statusStrip.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.toolStripStatusLabel1,
            this.statusLabel});
            this.statusStrip.Location = new System.Drawing.Point(0, 368);
            this.statusStrip.Name = "statusStrip";
            this.statusStrip.Size = new System.Drawing.Size(826, 22);
            this.statusStrip.SizingGrip = false;
            this.statusStrip.TabIndex = 7;
            this.statusStrip.Text = "statusStrip1";
            // 
            // toolStripStatusLabel1
            // 
            this.toolStripStatusLabel1.Name = "toolStripStatusLabel1";
            this.toolStripStatusLabel1.Size = new System.Drawing.Size(123, 17);
            this.toolStripStatusLabel1.Text = "Syncronization Status:";
            // 
            // statusLabel
            // 
            this.statusLabel.Name = "statusLabel";
            this.statusLabel.Size = new System.Drawing.Size(48, 17);
            this.statusLabel.Text = "Waiting";
            // 
            // queuedRunList
            // 
            this.queuedRunList.DisplayMember = "Name";
            this.queuedRunList.FormattingEnabled = true;
            this.queuedRunList.Location = new System.Drawing.Point(12, 114);
            this.queuedRunList.Name = "queuedRunList";
            this.queuedRunList.ScrollAlwaysVisible = true;
            this.queuedRunList.SelectionMode = System.Windows.Forms.SelectionMode.MultiExtended;
            this.queuedRunList.Size = new System.Drawing.Size(298, 121);
            this.queuedRunList.TabIndex = 8;
            this.queuedRunList.ValueMember = "Path";
            // 
            // runProgressBar
            // 
            this.runProgressBar.Location = new System.Drawing.Point(59, 295);
            this.runProgressBar.Name = "runProgressBar";
            this.runProgressBar.Size = new System.Drawing.Size(555, 23);
            this.runProgressBar.TabIndex = 9;
            // 
            // preferencesBtn
            // 
            this.preferencesBtn.Location = new System.Drawing.Point(669, 324);
            this.preferencesBtn.Name = "preferencesBtn";
            this.preferencesBtn.Size = new System.Drawing.Size(128, 23);
            this.preferencesBtn.TabIndex = 11;
            this.preferencesBtn.Text = "Preferences";
            this.preferencesBtn.UseVisualStyleBackColor = true;
            this.preferencesBtn.Click += new System.EventHandler(this.preferencesBtn_Click);
            // 
            // pictureBox1
            // 
            this.pictureBox1.Image = global::SSLIMS.Properties.Resources.logo;
            this.pictureBox1.InitialImage = ((System.Drawing.Image)(resources.GetObject("pictureBox1.InitialImage")));
            this.pictureBox1.Location = new System.Drawing.Point(645, 28);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.Size = new System.Drawing.Size(169, 136);
            this.pictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.pictureBox1.TabIndex = 6;
            this.pictureBox1.TabStop = false;
            // 
            // clientName
            // 
            this.clientName.AutoSize = true;
            this.clientName.Font = new System.Drawing.Font("Microsoft Sans Serif", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.clientName.Location = new System.Drawing.Point(144, 28);
            this.clientName.Name = "clientName";
            this.clientName.Size = new System.Drawing.Size(65, 20);
            this.clientName.TabIndex = 13;
            this.clientName.Text = "3730XL";
            // 
            // uploadedRunsLabel
            // 
            this.uploadedRunsLabel.AutoSize = true;
            this.uploadedRunsLabel.Location = new System.Drawing.Point(313, 94);
            this.uploadedRunsLabel.Name = "uploadedRunsLabel";
            this.uploadedRunsLabel.Size = new System.Drawing.Size(122, 13);
            this.uploadedRunsLabel.TabIndex = 14;
            this.uploadedRunsLabel.Text = "Completed Run Uploads";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(12, 94);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(110, 13);
            this.label2.TabIndex = 15;
            this.label2.Text = "Queued Run Uploads";
            // 
            // runDirectoryLabel
            // 
            this.runDirectoryLabel.AutoSize = true;
            this.runDirectoryLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 12F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.runDirectoryLabel.Location = new System.Drawing.Point(15, 54);
            this.runDirectoryLabel.Name = "runDirectoryLabel";
            this.runDirectoryLabel.Size = new System.Drawing.Size(124, 20);
            this.runDirectoryLabel.TabIndex = 16;
            this.runDirectoryLabel.Text = "Run Directory:";
            // 
            // runDirectory
            // 
            this.runDirectory.AutoSize = true;
            this.runDirectory.Font = new System.Drawing.Font("Microsoft Sans Serif", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.runDirectory.Location = new System.Drawing.Point(144, 54);
            this.runDirectory.Name = "runDirectory";
            this.runDirectory.Size = new System.Drawing.Size(98, 20);
            this.runDirectory.TabIndex = 17;
            this.runDirectory.Text = "D:\\Run Data";
            // 
            // completeRunList
            // 
            this.completeRunList.ContextMenuStrip = this.completedRunContextMenu;
            this.completeRunList.DisplayMember = "Name";
            this.completeRunList.FormattingEnabled = true;
            this.completeRunList.Location = new System.Drawing.Point(316, 114);
            this.completeRunList.Name = "completeRunList";
            this.completeRunList.ScrollAlwaysVisible = true;
            this.completeRunList.SelectionMode = System.Windows.Forms.SelectionMode.MultiExtended;
            this.completeRunList.Size = new System.Drawing.Size(298, 121);
            this.completeRunList.TabIndex = 18;
            this.completeRunList.ValueMember = "Path";
            this.completeRunList.MouseUp += new System.Windows.Forms.MouseEventHandler(this.completeRunList_MouseUp);
            // 
            // completedRunContextMenu
            // 
            this.completedRunContextMenu.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.requeueItem});
            this.completedRunContextMenu.Name = "completedRunContextMenu";
            this.completedRunContextMenu.Size = new System.Drawing.Size(219, 26);
            // 
            // requeueItem
            // 
            this.requeueItem.Name = "requeueItem";
            this.requeueItem.Size = new System.Drawing.Size(218, 22);
            this.requeueItem.Text = "Requeue Run(s) For Upload";
            this.requeueItem.Click += new System.EventHandler(this.requeueItem_Click);
            // 
            // totalProgressBar
            // 
            this.totalProgressBar.Location = new System.Drawing.Point(59, 324);
            this.totalProgressBar.Name = "totalProgressBar";
            this.totalProgressBar.Size = new System.Drawing.Size(555, 23);
            this.totalProgressBar.TabIndex = 19;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label3.Location = new System.Drawing.Point(9, 298);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(30, 13);
            this.label3.TabIndex = 20;
            this.label3.Text = "Run:";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label4.Location = new System.Drawing.Point(9, 329);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(34, 13);
            this.label4.TabIndex = 21;
            this.label4.Text = "Total:";
            // 
            // hrLabel
            // 
            this.hrLabel.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.hrLabel.Location = new System.Drawing.Point(0, 250);
            this.hrLabel.Name = "hrLabel";
            this.hrLabel.Size = new System.Drawing.Size(630, 2);
            this.hrLabel.TabIndex = 22;
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label5.Location = new System.Drawing.Point(9, 263);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(100, 13);
            this.label5.TabIndex = 23;
            this.label5.Text = "Upload Progress";
            // 
            // label6
            // 
            this.label6.AutoSize = true;
            this.label6.Location = new System.Drawing.Point(247, 263);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(67, 13);
            this.label6.TabIndex = 24;
            this.label6.Text = "Current Run:";
            // 
            // currentRunText
            // 
            this.currentRunText.AutoSize = true;
            this.currentRunText.Location = new System.Drawing.Point(313, 263);
            this.currentRunText.Name = "currentRunText";
            this.currentRunText.Size = new System.Drawing.Size(33, 13);
            this.currentRunText.TabIndex = 25;
            this.currentRunText.Text = "None";
            // 
            // label8
            // 
            this.label8.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.label8.Location = new System.Drawing.Point(0, 83);
            this.label8.Name = "label8";
            this.label8.Size = new System.Drawing.Size(630, 2);
            this.label8.TabIndex = 26;
            // 
            // label9
            // 
            this.label9.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.label9.Location = new System.Drawing.Point(627, 24);
            this.label9.Name = "label9";
            this.label9.Size = new System.Drawing.Size(2, 344);
            this.label9.TabIndex = 27;
            // 
            // startUploadBtn
            // 
            this.startUploadBtn.Location = new System.Drawing.Point(669, 200);
            this.startUploadBtn.Name = "startUploadBtn";
            this.startUploadBtn.Size = new System.Drawing.Size(128, 23);
            this.startUploadBtn.TabIndex = 28;
            this.startUploadBtn.Text = "Start Upload";
            this.startUploadBtn.UseVisualStyleBackColor = true;
            this.startUploadBtn.Click += new System.EventHandler(this.startUploadBtn_Click);
            // 
            // stopUploadBtn
            // 
            this.stopUploadBtn.Enabled = false;
            this.stopUploadBtn.Location = new System.Drawing.Point(669, 229);
            this.stopUploadBtn.Name = "stopUploadBtn";
            this.stopUploadBtn.Size = new System.Drawing.Size(128, 23);
            this.stopUploadBtn.TabIndex = 29;
            this.stopUploadBtn.Text = "Stop";
            this.stopUploadBtn.UseVisualStyleBackColor = true;
            this.stopUploadBtn.Click += new System.EventHandler(this.stopUploadBtn_Click);
            // 
            // checkActivationTimer
            // 
            this.checkActivationTimer.Interval = 5000;
            this.checkActivationTimer.Tick += new System.EventHandler(this.checkActivationTimer_Tick);
            // 
            // downloadPltBtn
            // 
            this.downloadPltBtn.Location = new System.Drawing.Point(669, 295);
            this.downloadPltBtn.Name = "downloadPltBtn";
            this.downloadPltBtn.Size = new System.Drawing.Size(128, 23);
            this.downloadPltBtn.TabIndex = 30;
            this.downloadPltBtn.Text = "Download .plt";
            this.downloadPltBtn.UseVisualStyleBackColor = true;
            this.downloadPltBtn.Click += new System.EventHandler(this.downloadPltBtn_Click);
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(826, 390);
            this.Controls.Add(this.downloadPltBtn);
            this.Controls.Add(this.stopUploadBtn);
            this.Controls.Add(this.startUploadBtn);
            this.Controls.Add(this.label9);
            this.Controls.Add(this.label8);
            this.Controls.Add(this.runDirectory);
            this.Controls.Add(this.currentRunText);
            this.Controls.Add(this.clientName);
            this.Controls.Add(this.runDirectoryLabel);
            this.Controls.Add(this.label6);
            this.Controls.Add(this.clientNameLabel);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.hrLabel);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.totalProgressBar);
            this.Controls.Add(this.completeRunList);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.uploadedRunsLabel);
            this.Controls.Add(this.preferencesBtn);
            this.Controls.Add(this.runProgressBar);
            this.Controls.Add(this.queuedRunList);
            this.Controls.Add(this.statusStrip);
            this.Controls.Add(this.pictureBox1);
            this.Controls.Add(this.topMenuStrip);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MainMenuStrip = this.topMenuStrip;
            this.MaximizeBox = false;
            this.Name = "MainForm";
            this.Text = "SSLIMS Client";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.SSLIMS_FormClosing);
            this.taskbarContextMenu.ResumeLayout(false);
            this.topMenuStrip.ResumeLayout(false);
            this.topMenuStrip.PerformLayout();
            this.statusStrip.ResumeLayout(false);
            this.statusStrip.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            this.completedRunContextMenu.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label clientNameLabel;
        private System.Windows.Forms.NotifyIcon trayIcon;
        private System.Windows.Forms.MenuStrip topMenuStrip;
        private System.Windows.Forms.ToolStripMenuItem fileToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem exitToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem editToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem preferencesToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem helpToolStripMenuItem;
        private System.Windows.Forms.PictureBox pictureBox1;
        private System.Windows.Forms.StatusStrip statusStrip;
        private System.Windows.Forms.ToolStripStatusLabel toolStripStatusLabel1;
        private System.Windows.Forms.ListBox queuedRunList;
        private System.Windows.Forms.ProgressBar runProgressBar;
        private System.Windows.Forms.ToolStripStatusLabel statusLabel;
        private System.Windows.Forms.Button preferencesBtn;
        private System.Windows.Forms.ContextMenuStrip taskbarContextMenu;
        private System.Windows.Forms.ToolStripMenuItem exitMenuItem;
        private System.Windows.Forms.Label clientName;
        private System.Windows.Forms.Label uploadedRunsLabel;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label runDirectoryLabel;
        private System.Windows.Forms.Label runDirectory;
        private System.Windows.Forms.ListBox completeRunList;
        private System.Windows.Forms.ProgressBar totalProgressBar;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.Label hrLabel;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.Label currentRunText;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.Label label9;
        private System.Windows.Forms.ToolStripMenuItem resetApplicationDataPreferencesToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem aboutToolStripMenuItem;
        private System.Windows.Forms.Button startUploadBtn;
        private System.Windows.Forms.Button stopUploadBtn;
        private System.Windows.Forms.Timer checkActivationTimer;
        private System.Windows.Forms.ContextMenuStrip completedRunContextMenu;
        private System.Windows.Forms.ToolStripMenuItem requeueItem;
        private System.Windows.Forms.ToolStripMenuItem downloadpltFileToolStripMenuItem;
        private System.Windows.Forms.Button downloadPltBtn;
    }
}

