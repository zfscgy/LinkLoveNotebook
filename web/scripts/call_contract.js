// const U3Utils = require('u3-utils/src')
// const {createU3, format, listener} = require('u3.js')
// const config = require('../config')

let u3 = U3.createU3({
  httpEndpoint: 'http://pioneer.natapp1.cc',
  httpEndpoint_history: 'http://pioneer-history.natapp1.cc',
  broadcast: true,
  debug: false,
  sign: true,
  logger: {
      log: console.log,
      error: console.error,
      debug: console.log
  },
  chainId:'20c35b993c10b5ea1007014857bb2b8832fb8ae22e9dcfdc61dacf336af4450f',
  keyProvider:'5J86vjJ7BrMENTmfghjdmWfZ9PDWCioQUmnMtu9Y9gmvGhpuDVz',//chendh1's private key
  symbol: 'UGAS'
});

async function test() {
  console.log("print results!");
  let contract = await u3.contract("chendh1");
  // 获取某个用户的好友 results = "user id = u1, friends = u2,u3"
  // let result = await contract.getFriends("u1", { authorization: [`chendh1@active`] });
  // console.log(result["processed"]["action_traces"][0]["return_value"]);

  // 创建笔记本
  let tx = contract.createNotebook("nb2", "nb2", "First notebook", ["u1","u2","u3"], 1, { authorization: [`chendh1@active`] });
  console.log(tx)
  };

test();
