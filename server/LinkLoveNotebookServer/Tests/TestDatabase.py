import Database as D

# 创建一个账户
res = D.user_register("zf", "0", "郑非", "null")
print(res)
# 查询账户信息
res = D.get_account_info("zf")
print(res)
# 创建一个笔记本
res = D.create_notebook("zf_note01", "笔记本0", 1, "测试的笔记本", [1])
print(res)
# 获得笔记本信息
res = D.get_notebook_info("zf_note01")
print(res)
# 写笔记本信息
res = D.write_notebook_content(1, 1, "笔记本0回复1")
print(res)
# 给笔记本回复打钱
res = D.vote_content(1, 1, 3, 100)
print(res)
# 查询内容
res = D.get_notebook_contents(1, 0, 100)
print(res)
# 写笔记本信息
