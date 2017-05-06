
#  abiparser.py  --  A module for parsing ABI files
#
#  Copyright (c) 2004, 2005 Hidayat Trimarsanto <trimarsanto@gmail.com>
#
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#
#  Main classes:
#
#  Trace ->
#    Trace(data) - data is the trace data
#    getSize(tagname) - return the size (amount) of data under tagname
#    getData(tagname) - return the data under tagname
#
#  SeqTrace -> (hmm, please look the source)
#
#  TODO: finishing class Gel


__version__ = '0.17'


import struct, bisect


class _TagRecord(object):
    # to overcome the bugs introduced by ABI programs
    exception_type = { 'GELP': 2 }

    def __init__(self, tag, no, abi_type, len_type, N, size, rec, cdata, _abiftrace=None):
        self._tag = tag
        self._no = no
        self._type = abi_type
            #   18 -> pascal String, eg xTheString x=size
            #    4 -> 16-bit short integer
            #    2 -> 8-bit char or C-string
            #    5 -> 32-bit float
            # 1024 -> blob ??
        self._len = len_type
        self._N = N
        self._size = size
        self._rec = rec
        self._cdata = cdata
        self._bdata = None
        self._abiftrace = _abiftrace

    def getData(self):
        """ return the data either as a list or as a single value """
        if not self._bdata:
            if self._size <= 4:
                # bdata as single value
                self._bdata = self._rec
            else:
                offset = struct.unpack('>l', self._rec)[0]
                buf = self._abiftrace._d[offset:offset + self._size]
                _type = self.exception_type.get(self._tag, self._type)
                if _type == 18:
                    fmt = 'x%ds' % (self._N - 1)
                elif _type == 2:
                    fmt = '%ds' % self._N
                elif _type == 4:
                    fmt = '>%dh' % self._N
                elif _type == 5:
                    fmt = '>%df' % self._N
                elif _type == 1024:
                    # just return as blob
                    fmt = '%ds' % self._size
                else:
                    raise RuntimeError
                # bdata as a list
                self._bdata = struct.unpack(fmt, buf)
                if self._N == 1 or self._type == 18 or self._type == 2:
                    # convert bdata as single value
                    self._bdata = self._bdata[0]
        # return bdata
        return self._bdata
        

class Trace(object):
    """
    Trace - main class that parses ABI trace file and keep each field under _TagRecord
    """

    fmt = '>4slhhll4sl'

    def __init__(self, data):
        """ data is the content of the trace file """
        self._d = data
        self._tag = {}
        if self.isABIF():
            self._NumRec = self.getLongAt(18)
            self._IdxBase = self.getLongAt(26)
            self._kwargs = { '_abiftrace': self }
            self._parseTag()
        else:
            raise RuntimeError, 'Invalid ABIF file format'

    def isABIF(self):
        if self._d[:4] == 'ABIF':
            return True
        elif self._d[128:131] == 'ABIF':
            self._d = self._d[128:]
            print >> sys.stderr, 'Warning: MacJunk detected'
            return True
        else:
            return False

    def getLongAt(self, offset):
        return self.getByteAt(offset, '>l', 4)

    def getIntAt(self, offset):
        return self.getByteAt(offset, '>i', 4)

    def getByteAt(self, o, c_type, length):
        return struct.unpack(c_type, self._d[o : o + 4])[0]

    def _readTagRecord(self, o):
        t = struct.unpack(self.fmt, self._d[o : o + 28])
        return _TagRecord(*t, **self._kwargs)

    def getTagRecord(self, tag):
        return self._tag[tag]

    def getTagRecordNo(self, tag, no):
        return self.getTagRecord(tag)[no]

    def _parseTag(self):
        for i in range(0, self._NumRec):
            t = self._readTagRecord(self._IdxBase + i * 28)
            if self._tag.has_key(t._tag):
                self._tag[t._tag][t._no] = t
            else:
                self._tag[t._tag] = { t._no: t }

    def getData(self, tagname):
        """ return a list of data under tagname """
        return self._tag[tagname[:4]][int(tagname[4:])].getData()
        return self.getTagRecordNo(tagname[:4], int(tagname[4:])).getData()

    def getSize(self, tagname):
        """ return the size (amount or length) of data under tagname """
        return self.getTagRecordNo(tagname[:4], int(tagname[4:]))._N

    def _getAllTags(self):
        """ low-level tag reader; not to be used """
        tags = []
        for i in range(0, self._NumRec):
            offset = self._IdxBase + i*28
            tags.append(struct.unpack(self.fmt, self._d[offset : offset + 28]))
        return tags


def open_trace(filename):
    return Trace(open(filename).read())


def open_gel(filename):
    return Gel(open(filename).read())


class Gel(object):
    """
    Gel - main class that parses ABI gel file
    """

    fmt = '<4s3s2s2s1s5s194h2s'

    def __init__(self, data):
        # it is probably unwise to load the gel file into memory
        self._d = data

    def getScanRecord(self, i):
        o = i * 407
        return struct.unpack(fmt, self._d[o : o + 407])

    def getDataOffset(self, i):
        pass
        

class ErrorFormat(RuntimeError):
    pass


class SeqTrace(Trace):
    """
    SeqTrace - class for parsing ABI trace file containing DNA sequences
    """

    def __init__(self, data):
        ABIFTrace.__init__(self, data)
        self.A = self.G = self.C = self.T = self.Basecalls = None
        self.sequence = ""
        #self.ATraceStart = self.CTraceStart = self.GTraceStart = self.TTraceStart = 0
        self.maximum = 0
        self.TraceLength = self.getSize('DATA12')
        self.SeqLength = self.getSize('PBAS1')
        self.Basecalls = self.getData('PLOC1')
        self.sequence = self.getData('PBAS1')
        self.setTraces()

    def getMaximum(self):
        if not self.maximum:
            self.maximum = max(max(self.T), max(self.A), max(self.G), max(self.C))
        return self.maximum

    def calculateScale(self, height):
        max = float(self.getMaximum())
        ht = float(height)
        return (ht-50.0)/max

    def getBasecallIndexAt(self, tracepos):
        return bisect.bisect(self.Basecalls, tracepos)

    def setTraces(self):
        order = self.getData('FWO_1')
        order.upper()
        self.A = self.getData('DATA%d' % (9 + order.index('A')))
        self.C = self.getData('DATA%d' % (9 + order.index('C')))
        self.T = self.getData('DATA%d' % (9 + order.index('T')))
        self.G = self.getData('DATA%d' % (9 + order.index('G')))
        
