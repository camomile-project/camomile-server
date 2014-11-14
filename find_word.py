import glob, os

words =["printRes"]
depth = 2
path = "*"
for i in range(depth):
	for file in glob.glob(path):
		if 'find_word.py' not in file:
			i=0
			l=[]
			if os.path.isfile(file):
				for line in open(file):
					i+=1
					for word in words:
						if word in line:
							l.append([i, line[:-1]])
							break
			if l != []:
				print '   ', file
				for i, line in l:
					print '       ', i, line
	path+="/*"

