using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.IO;

namespace SSLIMS
{
    // NEED TO IMPLEMENT
    class Logger
    {
        private string logSource;
        private string logname;
        private Properties.Settings settings = Properties.Settings.Default;

        public Logger(string source, string name)
        {
            logSource = source;
            logname = name;

            Directory.GetCurrentDirectory();
        }

        public void info(String msg)
        {
             
        }


        public void infoEventViewer(String msg)
        {
            EventLog.WriteEntry(logSource, msg);
        }

        //private void createLogIfNeeded()
        //{
        //    if (!settings.loggerRegistered)
        //    {
        //        EventLog.CreateEventSource(logSource, logname);
        //        settings.loggerRegistered = true;
        //        settings.Save();
        //    }
        //}
    }
}
