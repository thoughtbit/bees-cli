## 远程分支管理
1,从已有的分支创建新的分支(如从master分支),创建一个next分支

git checkout -b next

-b表示创建并切换分支
上面一条命令相当于一面的二条：
git branch next //创建分支
git checkout next //切换分支

2,创建完可以查看一下,分支已经切换到next

git branch

    * next

    master

3,提交该分支到远程仓库

git push origin next

4,测试从远程获取next

git pull origin next

5,我觉得现在重要的就是设置git push,pull默认的提交获取分支,这样就很方便的使用git push 提交信息或git pull获取信息

git branch --set-upstream-to=origin/next

取消对master的跟踪

git branch --unset-upstream master

6,现在随便修改一下工程文件的内容,然后git commit ,git push,之后就可以直接提交到远程的next分支中,而不会是master

7, 查看分支
git branch

8, 合并分支
git merge next
//用于合并指定分支到当前分支

git merge --no-ff -m "merge with no-ff" dev
//加上--no-ff参数就可以用普通模式合并，合并后的历史有分支，能看出来曾经做过合并

9, 删除分支

git branch -d next

## 标签
git v2.0
git push --tags

##

git commit -m "提交说明" # 将暂存区内容提交到本地仓库
git commit -a -m "提交说明" # 跳过缓存区操作，直接把工作区内容提交到本地仓库