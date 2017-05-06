using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Diagnostics;

namespace SSLIMS
{
    static class Program
    {

        public static bool IsProcessAlreadyOpen()
        {
            int instances = 0;

            foreach (Process clsProcess in Process.GetProcesses())
            {

                if (clsProcess.ProcessName == "SSLIMS")
                {
                    instances++;
                }
            }

            if (instances > 1) return true;
            return false;
        }

        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            if (IsProcessAlreadyOpen())
            {
                MessageBox.Show("An instance of SSLIMS is already running.");
            }
            else
            {
                
                try {
                    API apiClient = new API();

                    if ( apiClient.isClientRegistered().Result )
                    {
                        Application.Run(new MainForm(apiClient));
                    }
                    else
                    {
                        Application.Run(new Setup(apiClient));
                    }
                } catch (System.AggregateException e) {
                    MessageBox.Show("Error: Unable to connect to SSLIMS API. Please contact support for assistance.");
                }
                    
            }    
        }
    }
}
