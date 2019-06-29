# 链恋笔记本

一款区块链笔记本

## 设计思路

### 账户

每个账户能有一定数量的初始Token，Token可以用来创建笔记本、在该账户拥有写权限的笔记本上写内容、打赏他人的内容。

### 账户主页

每个账户有一个主页，可以在主页上设置一些笔记本公开。

### 笔记本

笔记本有以下 2 种类型：

* 公开型：任何人可以写，任何人可以将此笔记本放在自己的主页 
* 私有型：创建的时候创建者可以指定一些人作为共同作者，被指定的人可以同意或者拒绝。如果被指定的人同意成为共同作者，则拥有该笔记本的写权限，且可以将笔记本放在自己的主页。

笔记本可以由笔记本ID唯一确定，只有知道笔记本ID的人才可以访问到笔记本。如果ID比较长、复杂，则笔记本可以看做仅在知道ID的人里面私密传播。

### 笔记本内容

笔记本的内容可以包含文本、图片、链接等。写笔记本内容将消耗一定的Token。同时可以点赞笔记本内容，内容的作者会受到一部分Token作为激励。但是每个用户每天点赞能产生的收益量是有限的，以此可以避免刷赞的现象。同时也可以直接对内容作者打赏，打赏的Token将会直接发放给内容作者。

### Token发行制度

Token会随着整个数据库中内容的增加进行增发。增发的Token会空投给所有用户（具体分配比例待定）。同时用户可以通过法币充值来兑换Token，也可以在Token的交易市场购买Token。

### Token分红制度

链恋笔记本的项目盈利，将有一定比例发放给Token的持有者。持有者可以获得现金分红。

## 盈利模式展望

1. 广告收入。链恋笔记本可以在页面上植入广告以此获得收入。
2. Token出售收入。通过用户充值Token而得到盈利。

## 对标产品

1. 知识星球之类的知识付费社区。通过笔记本的隐私性建立小社群，给优质内容的创作者高回报。
2. 知乎之类的知识性网站。
3. 起点中文网之类的小说连载网站，读者付费支持作者的创作。
4. 微博等社交网站。有成本的创作使得人们会更加认真对待自己的每个发布，减少无意义的灌水内容。
5. 百度贴吧等论坛。公开的笔记本可以让大家一起热烈讨论。

## 风险

最主要的风险来自于政府的审查政策等。