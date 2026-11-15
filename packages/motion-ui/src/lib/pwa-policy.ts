/** O MRL é independente; nunca registrar service worker em iframe ou se explicitamente desativado. */
export function refuseOfflineWorker(hostname:string, production:boolean, framed:boolean, search:string, delegatedHost=""){
 const host=hostname.toLowerCase();
 return !production || framed || new URLSearchParams(search).get("sw")==="off" || (!!delegatedHost && host===delegatedHost.toLowerCase());
}
export function isRemoteNavigation({url,request,sameOrigin}:{url:URL;request:{mode:string};sameOrigin:boolean}){
 return sameOrigin && (url.pathname==="/" || url.pathname==="/remote") && (request.mode==="navigate" || url.searchParams.get("__mrl_shell")==="1");
}
