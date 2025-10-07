// Minimal VM checker for re-01 (obfuscated lightly)
(function(){
  const key = 'lemur';
  const b64 = 'LzErDgEYBBkQLRoIMkRBX1IQ';
  const dec = (s)=>Buffer.from(s,'base64');
  const xo = (buf)=>{
    const out = Buffer.alloc(buf.length);
    for(let i=0;i<buf.length;i++) out[i]=buf[i]^key.charCodeAt(i%key.length);
    return out;
  };
  function check(input){
    try{
      const ref = xo(dec(b64)).toString('utf8');
      return input===ref;
    }catch(e){return false}
  }
  // expose for console use
  if (typeof window!== 'undefined') window.vmLemurCheck = check;
})();