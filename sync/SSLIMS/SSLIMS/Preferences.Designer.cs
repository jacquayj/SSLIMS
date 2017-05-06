namespace SSLIMS
{
    partial class Preferences
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
            this.minimizeToTrayOnStartup = new System.Windows.Forms.CheckBox();
            this.autoUploadRunsChkBox = new System.Windows.Forms.CheckBox();
            this.label1 = new System.Windows.Forms.Label();
            this.clientNameText = new System.Windows.Forms.TextBox();
            this.runDirectoryText = new System.Windows.Forms.TextBox();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.button1 = new System.Windows.Forms.Button();
            this.saveBtn = new System.Windows.Forms.Button();
            this.label8 = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // minimizeToTrayOnStartup
            // 
            this.minimizeToTrayOnStartup.AutoSize = true;
            this.minimizeToTrayOnStartup.Location = new System.Drawing.Point(12, 54);
            this.minimizeToTrayOnStartup.Name = "minimizeToTrayOnStartup";
            this.minimizeToTrayOnStartup.Size = new System.Drawing.Size(154, 17);
            this.minimizeToTrayOnStartup.TabIndex = 0;
            this.minimizeToTrayOnStartup.Text = "Minimize to tray on startup?";
            this.minimizeToTrayOnStartup.UseVisualStyleBackColor = true;
            // 
            // autoUploadRunsChkBox
            // 
            this.autoUploadRunsChkBox.AutoSize = true;
            this.autoUploadRunsChkBox.Location = new System.Drawing.Point(12, 77);
            this.autoUploadRunsChkBox.Name = "autoUploadRunsChkBox";
            this.autoUploadRunsChkBox.Size = new System.Drawing.Size(112, 17);
            this.autoUploadRunsChkBox.TabIndex = 1;
            this.autoUploadRunsChkBox.Text = "Auto upload runs?";
            this.autoUploadRunsChkBox.UseVisualStyleBackColor = true;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("Microsoft Sans Serif", 14F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label1.Location = new System.Drawing.Point(9, 9);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(112, 24);
            this.label1.TabIndex = 2;
            this.label1.Text = "Preferences";
            // 
            // clientNameText
            // 
            this.clientNameText.Location = new System.Drawing.Point(91, 105);
            this.clientNameText.Name = "clientNameText";
            this.clientNameText.Size = new System.Drawing.Size(197, 20);
            this.clientNameText.TabIndex = 3;
            // 
            // runDirectoryText
            // 
            this.runDirectoryText.Location = new System.Drawing.Point(91, 131);
            this.runDirectoryText.Name = "runDirectoryText";
            this.runDirectoryText.Size = new System.Drawing.Size(197, 20);
            this.runDirectoryText.TabIndex = 4;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(10, 108);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(67, 13);
            this.label2.TabIndex = 5;
            this.label2.Text = "Client Name:";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(10, 134);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(75, 13);
            this.label3.TabIndex = 6;
            this.label3.Text = "Run Directory:";
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(288, 130);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(75, 23);
            this.button1.TabIndex = 7;
            this.button1.Text = "Browse...";
            this.button1.UseVisualStyleBackColor = true;
            // 
            // saveBtn
            // 
            this.saveBtn.Location = new System.Drawing.Point(13, 184);
            this.saveBtn.Name = "saveBtn";
            this.saveBtn.Size = new System.Drawing.Size(75, 23);
            this.saveBtn.TabIndex = 8;
            this.saveBtn.Text = "Save";
            this.saveBtn.UseVisualStyleBackColor = true;
            this.saveBtn.Click += new System.EventHandler(this.saveBtn_Click);
            // 
            // label8
            // 
            this.label8.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.label8.Location = new System.Drawing.Point(-27, 41);
            this.label8.Name = "label8";
            this.label8.Size = new System.Drawing.Size(490, 2);
            this.label8.TabIndex = 27;
            // 
            // label4
            // 
            this.label4.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.label4.Location = new System.Drawing.Point(-58, 172);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(490, 2);
            this.label4.TabIndex = 28;
            // 
            // Preferences
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(375, 218);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label8);
            this.Controls.Add(this.saveBtn);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.runDirectoryText);
            this.Controls.Add(this.clientNameText);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.autoUploadRunsChkBox);
            this.Controls.Add(this.minimizeToTrayOnStartup);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.Icon = global::SSLIMS.Properties.Resources.final;
            this.MaximizeBox = false;
            this.Name = "Preferences";
            this.Text = "SSLIMS Client Preferences";
            this.TopMost = true;
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Preferences_FormClosing);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.CheckBox minimizeToTrayOnStartup;
        private System.Windows.Forms.CheckBox autoUploadRunsChkBox;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox clientNameText;
        private System.Windows.Forms.TextBox runDirectoryText;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.Button saveBtn;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.Label label4;
    }
}