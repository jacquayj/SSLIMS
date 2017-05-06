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
    public partial class About : Form
    {
        private MainForm parent;
        private Properties.Settings settings = Properties.Settings.Default;

        public About(MainForm p)
        {
            parent = p;
            InitializeComponent();

            label1.Parent = pictureBox1;
            label2.Parent = pictureBox1;
            label3.Parent = pictureBox1;
            label4.Parent = pictureBox1;
            label5.Parent = pictureBox1;
            
        }

        private void Preferences_FormClosing(object sender, FormClosingEventArgs e)
        {
            parent.Focus();
        }

       



        
    }
}
