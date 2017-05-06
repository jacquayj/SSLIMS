from abiparser import *
import sys

ruby_input_file_path = sys.stdin.read()

abi_file = Trace(ruby_input_file_path)

print abi_file.getTagRecordNo(sys.argv[2], int(sys.argv[3])).getData()
