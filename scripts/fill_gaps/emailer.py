#!/usr/bin/env python3

# To ensure that this works, pin to yagmail 0.11.214

import argparse
import os
import yagmail

LISTFILE = '/tmp/missing_kupodm.txt'

# HACK: Monkey patch yagmail so that the displayed sender is 'DYBVDQ Bot' instead of the raw email address
# Designed for yagmail 0.11.214, may not work with other versions
# Actually this doesn't work because we need to patch yagmail.sender.make_addr_alias_user
# See http://blog.dscpl.com.au/2015/03/safely-applying-monkey-patches-in-python.html
# So instead we directly set yag.useralias

# def _make_addr_alias_user(email_addr):
#     return email_addr, 'DYBVDQ Bot'

# yagmail.headers.make_addr_alias_user = _make_addr_alias_user

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('gmailuser')
    ap.add_argument('gmailpass')
    ap.add_argument('recipients', nargs='+')
    args = ap.parse_args()

    cmd = 'scp mkramer@lxslc6.ihep.ac.cn:workfs/db_fill2/data/misc/missing_kupodm.txt /tmp'
    os.system(cmd)

    nfiles = len(open(LISTFILE).readlines())
    msg = '%d files total, please see attachment.' % nfiles

    yag = yagmail.SMTP(args.gmailuser, args.gmailpass)
    yag.useralias = 'DYBVDQ Bot'  # HACK, may not work with yagmail != 0.11.214

    yag.send(to=args.recipients, subject='Missing KUP/ODM',
             contents=[msg, LISTFILE])

    os.remove(LISTFILE)

if __name__ == '__main__':
    main()
