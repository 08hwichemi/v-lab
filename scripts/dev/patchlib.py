# [작업 도구] 큰 HTML 파일을 안전하게 고치는 작은 도우미: 바꿀 문자열이 정확히 count 번 나올 때만 바꾼다.
# 사용: from patchlib import P; p=P('labs/...html'); p.rep(옛, 새, count=1); p.save()
import sys
class P:
    def __init__(s,path): s.path=path; s.t=open(path,encoding='utf-8').read(); s.n=0
    def rep(s,old,new,count=1):
        c=s.t.count(old)
        if c!=count: raise SystemExit('COUNT %d (want %d): %r'%(c,count,old[:90]))
        s.t=s.t.replace(old,new); s.n+=1
    def save(s): open(s.path,'w',encoding='utf-8').write(s.t); print('applied',s.n)
