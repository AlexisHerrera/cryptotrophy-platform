const url=args[0];
const jsonPath=args[1];
const response=await Functions.makeHttpRequest({url:url,method:'GET',headers:{'Content-Type':'application/json'}});
if(response.error)throw Error('Request failed :(.');
let result=response.data;
for(const p of jsonPath.split('.')){result=result[p];if(result===undefined)throw Error('Invalid path');}
if(typeof result!=='boolean')throw Error('Not boolean');
return Functions.encodeUint256(result?0:1);
