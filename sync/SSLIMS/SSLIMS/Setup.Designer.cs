namespace SSLIMS
{
    partial class Setup
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
            this.clientNewText = new System.Windows.Forms.TextBox();
            this.clientNewNameLabel = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            this.newClientRadio = new System.Windows.Forms.RadioButton();
            this.existingClientRadio = new System.Windows.Forms.RadioButton();
            this.clientChoiceCombo = new System.Windows.Forms.ComboBox();
            this.clientChoiceLabel = new System.Windows.Forms.Label();
            this.runDirectoryText = new System.Windows.Forms.TextBox();
            this.runDirectoryBrowseBtn = new System.Windows.Forms.Button();
            this.label1 = new System.Windows.Forms.Label();
            this.hrLabel = new System.Windows.Forms.Label();
            this.saveSettingsBtn = new System.Windows.Forms.Button();
            this.exitAppBtn = new System.Windows.Forms.Button();
            this.runDirectoryDialog = new System.Windows.Forms.FolderBrowserDialog();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            this.SuspendLayout();
            // 
            // clientNewText
            // 
            this.clientNewText.Location = new System.Drawing.Point(17, 147);
            this.clientNewText.Name = "clientNewText";
            this.clientNewText.Size = new System.Drawing.Size(213, 20);
            this.clientNewText.TabIndex = 0;
            // 
            // clientNewNameLabel
            // 
            this.clientNewNameLabel.AutoSize = true;
            this.clientNewNameLabel.Location = new System.Drawing.Point(14, 131);
            this.clientNewNameLabel.Name = "clientNewNameLabel";
            this.clientNewNameLabel.Size = new System.Drawing.Size(92, 13);
            this.clientNewNameLabel.TabIndex = 1;
            this.clientNewNameLabel.Text = "New Client Name:";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Font = new System.Drawing.Font("Microsoft Sans Serif", 18F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label2.Location = new System.Drawing.Point(12, 12);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(189, 29);
            this.label2.TabIndex = 3;
            this.label2.Text = "Let\'s Get Started";
            // 
            // pictureBox1
            // 
            this.pictureBox1.Image = global::SSLIMS.Properties.Resources.logo;
            this.pictureBox1.Location = new System.Drawing.Point(245, 12);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.Size = new System.Drawing.Size(161, 128);
            this.pictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.pictureBox1.TabIndex = 4;
            this.pictureBox1.TabStop = false;
            // 
            // newClientRadio
            // 
            this.newClientRadio.AutoSize = true;
            this.newClientRadio.Checked = true;
            this.newClientRadio.Location = new System.Drawing.Point(17, 56);
            this.newClientRadio.Name = "newClientRadio";
            this.newClientRadio.Size = new System.Drawing.Size(164, 17);
            this.newClientRadio.TabIndex = 5;
            this.newClientRadio.TabStop = true;
            this.newClientRadio.Text = "I need to register a new client";
            this.newClientRadio.UseVisualStyleBackColor = true;
            // 
            // existingClientRadio
            // 
            this.existingClientRadio.AutoSize = true;
            this.existingClientRadio.Location = new System.Drawing.Point(17, 79);
            this.existingClientRadio.Name = "existingClientRadio";
            this.existingClientRadio.Size = new System.Drawing.Size(183, 17);
            this.existingClientRadio.TabIndex = 6;
            this.existingClientRadio.Text = "I\'m reconfiguring an existing client";
            this.existingClientRadio.UseVisualStyleBackColor = true;
            this.existingClientRadio.CheckedChanged += new System.EventHandler(this.existingClientRadio_CheckedChanged);
            // 
            // clientChoiceCombo
            // 
            this.clientChoiceCombo.FormattingEnabled = true;
            this.clientChoiceCombo.Location = new System.Drawing.Point(17, 146);
            this.clientChoiceCombo.Name = "clientChoiceCombo";
            this.clientChoiceCombo.Size = new System.Drawing.Size(213, 21);
            this.clientChoiceCombo.TabIndex = 7;
            this.clientChoiceCombo.Visible = false;
            // 
            // clientChoiceLabel
            // 
            this.clientChoiceLabel.AutoSize = true;
            this.clientChoiceLabel.Location = new System.Drawing.Point(14, 131);
            this.clientChoiceLabel.Name = "clientChoiceLabel";
            this.clientChoiceLabel.Size = new System.Drawing.Size(75, 13);
            this.clientChoiceLabel.TabIndex = 8;
            this.clientChoiceLabel.Text = "Existing Client:";
            this.clientChoiceLabel.Visible = false;
            // 
            // runDirectoryText
            // 
            this.runDirectoryText.Location = new System.Drawing.Point(17, 195);
            this.runDirectoryText.Name = "runDirectoryText";
            this.runDirectoryText.Size = new System.Drawing.Size(213, 20);
            this.runDirectoryText.TabIndex = 9;
            this.runDirectoryText.Click += new System.EventHandler(this.runDirectoryText_Click);
            // 
            // runDirectoryBrowseBtn
            // 
            this.runDirectoryBrowseBtn.Location = new System.Drawing.Point(236, 194);
            this.runDirectoryBrowseBtn.Name = "runDirectoryBrowseBtn";
            this.runDirectoryBrowseBtn.Size = new System.Drawing.Size(75, 23);
            this.runDirectoryBrowseBtn.TabIndex = 10;
            this.runDirectoryBrowseBtn.Text = "Browse...";
            this.runDirectoryBrowseBtn.UseVisualStyleBackColor = true;
            this.runDirectoryBrowseBtn.Click += new System.EventHandler(this.runDirectoryBrowseBtn_Click);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(14, 179);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(75, 13);
            this.label1.TabIndex = 11;
            this.label1.Text = "Run Directory:";
            // 
            // hrLabel
            // 
            this.hrLabel.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.hrLabel.Location = new System.Drawing.Point(-105, 247);
            this.hrLabel.Name = "hrLabel";
            this.hrLabel.Size = new System.Drawing.Size(630, 2);
            this.hrLabel.TabIndex = 23;
            // 
            // saveSettingsBtn
            // 
            this.saveSettingsBtn.Location = new System.Drawing.Point(302, 259);
            this.saveSettingsBtn.Name = "saveSettingsBtn";
            this.saveSettingsBtn.Size = new System.Drawing.Size(106, 23);
            this.saveSettingsBtn.TabIndex = 24;
            this.saveSettingsBtn.Text = "Save Settings";
            this.saveSettingsBtn.UseVisualStyleBackColor = true;
            this.saveSettingsBtn.Click += new System.EventHandler(this.saveSettingsBtn_Click);
            // 
            // exitAppBtn
            // 
            this.exitAppBtn.Location = new System.Drawing.Point(12, 259);
            this.exitAppBtn.Name = "exitAppBtn";
            this.exitAppBtn.Size = new System.Drawing.Size(77, 23);
            this.exitAppBtn.TabIndex = 25;
            this.exitAppBtn.Text = "Exit";
            this.exitAppBtn.UseVisualStyleBackColor = true;
            this.exitAppBtn.Click += new System.EventHandler(this.exitAppBtn_Click);
            // 
            // runDirectoryDialog
            // 
            this.runDirectoryDialog.RootFolder = System.Environment.SpecialFolder.MyComputer;
            // 
            // Setup
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(420, 294);
            this.Controls.Add(this.exitAppBtn);
            this.Controls.Add(this.saveSettingsBtn);
            this.Controls.Add(this.hrLabel);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.runDirectoryBrowseBtn);
            this.Controls.Add(this.runDirectoryText);
            this.Controls.Add(this.clientChoiceLabel);
            this.Controls.Add(this.clientChoiceCombo);
            this.Controls.Add(this.existingClientRadio);
            this.Controls.Add(this.newClientRadio);
            this.Controls.Add(this.pictureBox1);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.clientNewNameLabel);
            this.Controls.Add(this.clientNewText);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Icon = global::SSLIMS.Properties.Resources.final;
            this.MaximizeBox = false;
            this.Name = "Setup";
            this.Text = "SSLIMS Setup";
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox clientNewText;
        private System.Windows.Forms.Label clientNewNameLabel;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.PictureBox pictureBox1;
        private System.Windows.Forms.RadioButton newClientRadio;
        private System.Windows.Forms.RadioButton existingClientRadio;
        private System.Windows.Forms.ComboBox clientChoiceCombo;
        private System.Windows.Forms.Label clientChoiceLabel;
        private System.Windows.Forms.TextBox runDirectoryText;
        private System.Windows.Forms.Button runDirectoryBrowseBtn;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label hrLabel;
        private System.Windows.Forms.Button saveSettingsBtn;
        private System.Windows.Forms.Button exitAppBtn;
        private System.Windows.Forms.FolderBrowserDialog runDirectoryDialog;
    }
}