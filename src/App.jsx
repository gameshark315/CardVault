import { useState, useEffect, useMemo, useCallback } from "react";

// ── PERIOD HELPERS ───────────────────────────────────────────────
const PCOUNT = {annual:1, semiannual:2, quarterly:4, monthly:12};
const PLABELS = {
  annual:["Annual"],
  semiannual:["Jan–Jun","Jul–Dec"],
  quarterly:["Q1","Q2","Q3","Q4"],
  monthly:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
};

const CATS = {
  dining:{label:"Dining",icon:"🍽"},
  groceries:{label:"Groceries",icon:"🛒"},
  gas:{label:"Gas & EV",icon:"⛽"},
  flights:{label:"Flights",icon:"✈"},
  hotels:{label:"Hotels",icon:"🏨"},
  streaming:{label:"Streaming",icon:"📺"},
  transit:{label:"Transit",icon:"🚇"},
  other:{label:"Everything Else",icon:"💳"},
};

const C = {
  bg:"#080B12",surface:"#0F1219",s2:"#161B27",s3:"#1E2538",
  border:"rgba(255,255,255,0.07)",border2:"rgba(255,255,255,0.13)",
  gold:"#C9A84C",goldL:"#E8C97A",
  green:"#4ADE80",red:"#F87171",blue:"#60A5FA",purple:"#A78BFA",
  text:"#E8EAF0",text2:"#8892A8",text3:"#4E5672",
};

// ── CARD DATABASE ─────────────────────────────────────────────────
const DB = {

  // ═══════════ AMERICAN EXPRESS ═══════════

  "amex-platinum": {
    id:"amex-platinum",name:"The Platinum Card®",issuer:"American Express",short:"Amex Platinum",
    annualFee:895,g1:"#787878",g2:"#C8C8C8",rewardType:"points",currency:"MR Points",cpp:0.02,
    mlaEligible:true,
    rates:{flights:5,hotels:5,dining:1,groceries:1,gas:1,streaming:1,transit:1,other:1},
    sub:{bonus:175000,spend:8000,months:6},
    benefits:[
      {id:"saks",       name:"Saks Fifth Ave Credit",          value:50,  period:"semiannual", group:"saks"},
      {id:"airline",    name:"Airline Fee Credit",              value:200, period:"annual",     group:"amex-airline"},
      {id:"uber-cash",  name:"Uber Cash",                      value:15,  period:"monthly",    group:"uber-cash"},
      {id:"uber-one",   name:"Uber One Membership Credit",     value:10,  period:"monthly",    group:"uber-one"},
      {id:"resy",       name:"Resy Dining Credit",             value:100, period:"quarterly",  group:"amex-resy"},
      {id:"digital",    name:"Digital Entertainment Credit",   value:25,  period:"monthly",    group:"amex-digital"},
      {id:"lululemon",  name:"lululemon Credit",               value:75,  period:"quarterly",  group:"lululemon"},
      {id:"oura",       name:"Oura Ring Credit",               value:200, period:"annual",     group:"oura"},
      {id:"hotel",      name:"FHR / Hotel Collection Credit",  value:300, period:"semiannual", group:"amex-plat-hotel"},
      {id:"walmart",    name:"Walmart+ Membership Credit",     value:155, period:"annual",     group:"amex-walmart"},
      {id:"equinox",    name:"Equinox Credit",                 value:25,  period:"monthly",    group:"equinox"},
      {id:"clear",      name:"CLEAR Plus Credit",              value:209, period:"annual",     group:"clear"},
      {id:"ge",         name:"Global Entry / TSA PreCheck",    value:100, period:"annual",     group:"global-entry"},
      {id:"lounge",     name:"Centurion Lounge Access",        value:0,   period:"annual"},
      {id:"ppass",      name:"Priority Pass Select",           value:0,   period:"annual"},
    ],
  },

  "amex-gold": {
    id:"amex-gold",name:"American Express® Gold Card",issuer:"American Express",short:"Amex Gold",
    annualFee:325,g1:"#A07820",g2:"#D4A830",rewardType:"points",currency:"MR Points",cpp:0.02,
    mlaEligible:true,
    rates:{flights:3,hotels:2,dining:4,groceries:4,gas:1,streaming:1,transit:1,other:1},
    sub:{bonus:60000,spend:6000,months:6},
    benefits:[
      {id:"dining",  name:"Dining Credit",              value:10, period:"monthly",    group:"amex-gold-dining"},
      {id:"uber",    name:"Uber Cash",                  value:10, period:"monthly",    group:"uber-cash"},
      {id:"resy",    name:"Resy Credit",                value:50, period:"semiannual", group:"amex-resy"},
      {id:"hotel",   name:"Hotel Credit (Amex Travel)", value:100,period:"annual",     group:"amex-gold-hotel"},
    ],
  },

  "amex-green": {
    id:"amex-green",name:"American Express® Green Card",issuer:"American Express",short:"Amex Green",
    annualFee:150,g1:"#1A4A2A",g2:"#2E7A42",rewardType:"points",currency:"MR Points",cpp:0.02,
    mlaEligible:true,
    rates:{flights:3,hotels:3,dining:3,groceries:1,gas:1,streaming:1,transit:3,other:1},
    sub:{bonus:40000,spend:3000,months:6},
    benefits:[
      {id:"clear",name:"CLEAR Plus Credit",value:209,period:"annual",group:"clear"},
    ],
  },

  "amex-bcp": {
    id:"amex-bcp",name:"Blue Cash Preferred® Card",issuer:"American Express",short:"Blue Cash Preferred",
    annualFee:95,g1:"#003580",g2:"#0055C8",rewardType:"cashback",currency:"Cash Back",cpp:0.01,
    mlaEligible:true,
    rates:{flights:1,hotels:1,dining:1,groceries:6,gas:3,streaming:6,transit:3,other:1},
    sub:{bonus:250,spend:3000,months:6},
    benefits:[
      {id:"disney",  name:"Disney Bundle Credit",value:7, period:"monthly",group:"disney-bundle"},
      {id:"equinox", name:"Equinox+ Credit",     value:10,period:"monthly",group:"equinox-plus"},
    ],
  },

  "amex-bce": {
    id:"amex-bce",name:"Blue Cash Everyday® Card",issuer:"American Express",short:"Blue Cash Everyday",
    annualFee:0,g1:"#00509A",g2:"#0070D8",rewardType:"cashback",currency:"Cash Back",cpp:0.01,
    mlaEligible:true,
    rates:{flights:1,hotels:1,dining:1,groceries:3,gas:2,streaming:3,transit:1,other:1},
    sub:{bonus:200,spend:2000,months:6},
    benefits:[
      {id:"disney",  name:"Disney Bundle Credit",value:7, period:"monthly",group:"disney-bundle"},
      {id:"home",    name:"Home Chef Credit",    value:15,period:"monthly",group:"home-chef"},
    ],
  },

  // ═══════════ CHASE ═══════════

  "chase-sapphire-reserve": {
    id:"chase-sapphire-reserve",name:"Chase Sapphire Reserve®",issuer:"Chase",short:"Sapphire Reserve",
    annualFee:795,g1:"#1A1A3C",g2:"#383890",rewardType:"points",currency:"UR Points",cpp:0.015,
    mlaEligible:true,
    rates:{flights:4,hotels:4,dining:3,groceries:1,gas:1,streaming:1,transit:1,other:1},
    sub:{bonus:100000,spend:5000,months:3},
    benefits:[
      {id:"travel",   name:"Annual Travel Credit",              value:300,period:"annual",     group:"csr-travel"},
      {id:"edit",     name:"The Edit Hotel Credit",             value:250,period:"semiannual", group:"csr-edit"},
      {id:"stubhub",  name:"StubHub / Viagogo Credit",         value:150,period:"semiannual", group:"csr-stubhub"},
      {id:"dining",   name:"Sapphire Reserve Dining Credit",   value:150,period:"semiannual", group:"csr-dining"},
      {id:"apple",    name:"Apple TV+ & Apple Music",          value:288,period:"annual",     group:"csr-apple"},
      {id:"lyft",     name:"Lyft In-App Credits",              value:10, period:"monthly",    group:"lyft"},
      {id:"peloton",  name:"Peloton Membership Credit",        value:120,period:"annual",     group:"peloton"},
      {id:"doordash", name:"DoorDash Monthly Promos",          value:25, period:"monthly",    group:"doordash-promos"},
      {id:"ge",       name:"Global Entry / TSA PreCheck",      value:120,period:"annual",     group:"global-entry"},
      {id:"lounge",   name:"Chase Sapphire Lounge Access",     value:0,  period:"annual"},
      {id:"ppass",    name:"Priority Pass Select",             value:0,  period:"annual"},
      {id:"dashpass", name:"DashPass Membership",              value:0,  period:"annual"},
    ],
  },

  "chase-sapphire-preferred": {
    id:"chase-sapphire-preferred",name:"Chase Sapphire Preferred®",issuer:"Chase",short:"Sapphire Preferred",
    annualFee:95,g1:"#183828",g2:"#285848",rewardType:"points",currency:"UR Points",cpp:0.0125,
    mlaEligible:true,
    rates:{flights:2,hotels:2,dining:3,groceries:3,gas:1,streaming:3,transit:2,other:1},
    sub:{bonus:75000,spend:4000,months:3},
    benefits:[
      {id:"hotel",    name:"Annual Hotel Credit (Chase Travel)", value:50, period:"annual",  group:"csp-hotel"},
      {id:"doordash", name:"DoorDash Monthly Promos",           value:10, period:"monthly", group:"doordash-promos"},
      {id:"dashpass", name:"DashPass Membership",               value:0,  period:"annual"},
    ],
  },

  "chase-freedom-flex": {
    id:"chase-freedom-flex",name:"Chase Freedom Flex℠",issuer:"Chase",short:"Freedom Flex",
    annualFee:0,g1:"#1A3060",g2:"#2244A0",rewardType:"cashback",currency:"Cash Back",cpp:0.01,
    mlaEligible:true,
    rates:{flights:5,hotels:5,dining:3,groceries:1,gas:1,streaming:1,transit:1,other:1},
    sub:{bonus:200,spend:500,months:3},
    benefits:[
      {id:"cell",  name:"Cell Phone Protection (up to $800/claim)",value:0,period:"annual"},
    ],
  },

  "cfu": {
    id:"cfu",name:"Chase Freedom Unlimited®",issuer:"Chase",short:"Freedom Unlimited",
    annualFee:0,g1:"#182860",g2:"#284898",rewardType:"cashback",currency:"Cash Back",cpp:0.01,
    mlaEligible:true,
    rates:{flights:5,hotels:5,dining:3,groceries:1.5,gas:1.5,streaming:1.5,transit:1.5,other:1.5},
    sub:{bonus:200,spend:500,months:3},
    benefits:[],
  },

  "ink-preferred": {
    id:"ink-preferred",name:"Ink Business Preferred® Card",issuer:"Chase",short:"Ink Preferred",
    annualFee:95,g1:"#202020",g2:"#484848",rewardType:"points",currency:"UR Points",cpp:0.0125,
    mlaEligible:false,
    rates:{flights:3,hotels:3,dining:1,groceries:1,gas:1,streaming:1,transit:3,other:1},
    sub:{bonus:90000,spend:8000,months:3},
    benefits:[],
  },

  "ink-cash": {
    id:"ink-cash",name:"Ink Business Cash® Credit Card",issuer:"Chase",short:"Ink Cash",
    annualFee:0,g1:"#303030",g2:"#585858",rewardType:"cashback",currency:"Cash Back",cpp:0.01,
    mlaEligible:false,
    rates:{flights:1,hotels:1,dining:2,groceries:1,gas:2,streaming:1,transit:1,other:1},
    sub:{bonus:350,spend:3000,months:3},
    benefits:[],
  },

  "ink-unlimited": {
    id:"ink-unlimited",name:"Ink Business Unlimited® Credit Card",issuer:"Chase",short:"Ink Unlimited",
    annualFee:0,g1:"#252525",g2:"#505050",rewardType:"cashback",currency:"Cash Back",cpp:0.01,
    mlaEligible:false,
    rates:{flights:1.5,hotels:1.5,dining:1.5,groceries:1.5,gas:1.5,streaming:1.5,transit:1.5,other:1.5},
    sub:{bonus:750,spend:6000,months:3},
    benefits:[],
  },

  // ═══════════ CAPITAL ONE ═══════════

  "venture-x": {
    id:"venture-x",name:"Capital One Venture X",issuer:"Capital One",short:"Venture X",
    annualFee:395,g1:"#6B0A0A",g2:"#B01828",rewardType:"miles",currency:"Venture Miles",cpp:0.01,
    mlaEligible:true,
    rates:{flights:10,hotels:10,dining:2,groceries:2,gas:2,streaming:2,transit:2,other:2},
    sub:{bonus:75000,spend:4000,months:3},
    benefits:[
      {id:"travel",      name:"Travel Credit (Capital One Travel)",value:300,period:"annual",group:"venture-travel"},
      {id:"ge",          name:"Global Entry / TSA PreCheck",       value:100,period:"annual",group:"global-entry"},
      {id:"anniversary", name:"10k Anniversary Miles (~$100)",     value:100,period:"annual",group:"venture-anniversary"},
      {id:"lounge",      name:"Capital One Lounge Access",         value:0,  period:"annual"},
      {id:"ppass",       name:"Priority Pass Membership",          value:0,  period:"annual"},
    ],
  },

  // ═══════════ CITI ═══════════

  "citi-strata-premier": {
    id:"citi-strata-premier",name:"Citi Strata Premier® Card",issuer:"Citi",short:"Strata Premier",
    annualFee:95,g1:"#002868",g2:"#003EA8",rewardType:"points",currency:"ThankYou Points",cpp:0.017,
    mlaEligible:true,
    rates:{flights:3,hotels:3,dining:3,groceries:3,gas:3,streaming:1,transit:1,other:1},
    sub:{bonus:60000,spend:4000,months:3},
    benefits:[
      {id:"hotel",name:"Annual Hotel Benefit ($100 off $500+ stay via Citi Travel)",value:100,period:"annual",group:"citi-hotel"},
    ],
  },

  "citi-double-cash": {
    id:"citi-double-cash",name:"Citi Double Cash® Card",issuer:"Citi",short:"Double Cash",
    annualFee:0,g1:"#002070",g2:"#003AB8",rewardType:"cashback",currency:"ThankYou Points",cpp:0.01,
    mlaEligible:true,
    rates:{flights:2,hotels:2,dining:2,groceries:2,gas:2,streaming:2,transit:2,other:2},
    sub:{bonus:200,spend:1500,months:6},
    benefits:[],
  },

  // ═══════════ WELLS FARGO ═══════════

  "wells-autograph": {
    id:"wells-autograph",name:"Wells Fargo Autograph℠ Card",issuer:"Wells Fargo",short:"WF Autograph",
    annualFee:0,g1:"#880000",g2:"#CC0000",rewardType:"points",currency:"Rewards Points",cpp:0.01,
    mlaEligible:false,
    rates:{flights:3,hotels:3,dining:3,groceries:1,gas:3,streaming:3,transit:3,other:1},
    sub:{bonus:20000,spend:1000,months:3},
    benefits:[],
  },
};

// ── BENEFIT HELPERS ───────────────────────────────────────────────
const bTotalValue = b => b.value*(PCOUNT[b.period||"annual"]||1);

const bUsedValue = (b,usage) => {
  const p=b.period||"annual";
  if(p==="annual"){
    if(typeof usage==="number") return Math.min(usage,b.value);
    return usage?b.value:0;
  }
  const arr=Array.isArray(usage)?usage:[];
  return arr.reduce((s,v)=>{
    if(typeof v==="number") return s+Math.min(v,b.value);
    return s+(v?b.value:0);
  },0);
};

const bSetAmount = (b,current,idx,amount) => {
  const p=b.period||"annual";
  if(p==="annual") return amount;
  const pcount=PCOUNT[p];
  const arr=Array.isArray(current)
    ?current.map(v=>typeof v==="boolean"?(v?b.value:0):v)
    :new Array(pcount).fill(0);
  const next=[...arr];
  next[idx]=amount;
  return next;
};

const uid=()=>Math.random().toString(36).slice(2,10);

function calcOffset(uc,mlaGlobal) {
  const card=DB[uc.cardId]; if(!card) return{fee:0,saved:0,pct:0};
  const waived=(mlaGlobal&&card.mlaEligible)||uc.mlaWaiver;
  if(waived) return{fee:0,saved:card.annualFee,pct:100,waived:true};
  const saved=card.benefits.reduce((s,b)=>s+bUsedValue(b,uc.benefitUsage?.[b.id]),0);
  const pct=card.annualFee>0?Math.min(100,(saved/card.annualFee)*100):100;
  return{fee:Math.max(0,card.annualFee-saved),saved,pct};
}

function subInfo(uc) {
  const card=DB[uc.cardId]; if(!card) return null;
  if(uc.noSub) return null;
  const spend=uc.subSpend||0;
  const target=uc.subTarget!=null?uc.subTarget:card.sub.spend;
  const months=uc.subMonths!=null?uc.subMonths:card.sub.months;
  const bonus=uc.subBonus!=null?uc.subBonus:card.sub.bonus;
  return{spend,target,months,bonus,
    pct:Math.min(100,(spend/(target||1))*100),
    remaining:Math.max(0,target-spend),
    done:spend>=target,
    currency:card.currency,rewardType:card.rewardType};
}

function useStored(key,init) {
  const [val,setVal]=useState(init);
  useEffect(()=>{
    (async()=>{try{const r=await window.storage.get(key);if(r?.value)setVal(JSON.parse(r.value));}catch{}})();
  },[key]);
  const set=useCallback(v=>{setVal(v);window.storage.set(key,JSON.stringify(v)).catch(()=>{});},[key]);
  return[val,set];
}

// ── UI PRIMITIVES ────────────────────────────────────────────────

function CardArt({card,sm,nickname}) {
  const w=sm?108:240,h=sm?68:152,r=sm?7:14;
  return(
    <div style={{width:w,height:h,borderRadius:r,flexShrink:0,
      background:`linear-gradient(140deg,${card.g1},${card.g2})`,
      boxShadow:"0 4px 20px rgba(0,0,0,0.55)",
      padding:sm?"7px 10px":"16px 18px",
      display:"flex",flexDirection:"column",justifyContent:"space-between",
      position:"relative",overflow:"hidden",userSelect:"none"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"40%",
        background:"linear-gradient(180deg,rgba(255,255,255,0.07),transparent)",pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontWeight:600,
          fontSize:sm?8:11,lineHeight:1.3,color:"rgba(255,255,255,0.95)",maxWidth:sm?72:185}}>
          {sm?(nickname||card.short):card.name}
        </div>
        <span style={{fontSize:sm?12:19,opacity:0.6}}>
          {card.issuer==="American Express"?"◉":card.issuer==="Chase"?"◈":card.issuer==="Capital One"?"◆":"●"}
        </span>
      </div>
      {!sm&&<div style={{fontFamily:"monospace",fontSize:12,letterSpacing:3,color:"rgba(255,255,255,0.28)"}}>•••• •••• •••• ••••</div>}
      <div style={{fontSize:sm?6.5:9,textTransform:"uppercase",letterSpacing:1.5,color:"rgba(255,255,255,0.4)",fontWeight:500}}>
        {card.issuer}
      </div>
    </div>
  );
}

function Bar({pct,color=C.gold,h=5}) {
  return(
    <div style={{height:h,background:"rgba(255,255,255,0.08)",borderRadius:h/2,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${pct}%`,borderRadius:h/2,
        background:pct>=100?C.green:color,transition:"width 0.5s ease"}}/>
    </div>
  );
}

function Pill({children,color=C.gold}) {
  return<span style={{background:color+"1E",color,border:`1px solid ${color}40`,
    borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{children}</span>;
}

function Stat({label,value,color=C.gold,sub}) {
  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 18px",flex:1,minWidth:0}}>
      <div style={{fontSize:10.5,color:C.text3,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:0.9}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color,fontFamily:"'Playfair Display',serif",letterSpacing:-0.5}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:C.text3,marginTop:3}}>{sub}</div>}
    </div>
  );
}

function Btn({children,onClick,gold,ghost,danger,full,style:sx}) {
  const base={border:"none",borderRadius:12,padding:"10px 18px",fontSize:13,
    fontWeight:600,cursor:"pointer",width:full?"100%":undefined,...sx};
  if(gold) return<button onClick={onClick} style={{...base,background:`linear-gradient(135deg,${C.gold},${C.goldL})`,color:"#1a1204"}}>{children}</button>;
  if(ghost) return<button onClick={onClick} style={{...base,background:"transparent",border:`1px solid ${C.border2}`,color:C.text2}}>{children}</button>;
  if(danger) return<button onClick={onClick} style={{...base,background:"transparent",border:`1px solid ${C.red}44`,color:C.red}}>{children}</button>;
  return<button onClick={onClick} style={{...base,background:C.s3,color:C.text}}>{children}</button>;
}

function Input({value,onChange,placeholder,type,style:sx}) {
  return<input value={value} onChange={onChange} placeholder={placeholder} type={type||"text"}
    style={{background:C.s2,border:`1px solid ${C.border2}`,borderRadius:10,
      padding:"9px 12px",color:C.text,fontSize:14,outline:"none",
      width:"100%",boxSizing:"border-box",...sx}}/>;
}

function Toggle({on,onToggle}) {
  return(
    <div onClick={onToggle} style={{width:46,height:25,borderRadius:13,cursor:"pointer",
      background:on?C.green:C.s3,border:`1px solid ${C.border2}`,
      position:"relative",transition:"background 0.2s",flexShrink:0}}>
      <div style={{width:19,height:19,borderRadius:10,background:"#fff",
        position:"absolute",top:2,left:on?24:3,transition:"left 0.2s"}}/>
    </div>
  );
}

function Overlay({onClose,children,title,wide}) {
  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(7px)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:20}}>
      <div style={{background:C.surface,border:`1px solid ${C.border2}`,borderRadius:20,
        width:"100%",maxWidth:wide?680:520,maxHeight:"88vh",
        display:"flex",flexDirection:"column",overflow:"hidden",animation:"popIn 0.18s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"18px 22px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:600}}>{title}</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",
            color:C.text2,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:14,
            display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",flex:1}}>{children}</div>
      </div>
    </div>
  );
}

function PeriodChips({benefit,usage,onSetAmount}) {
  const [editing,setEditing]=useState(null);
  const [inputVal,setInputVal]=useState("");
  const p=benefit.period||"annual";
  const labels=PLABELS[p];
  const pcount=PCOUNT[p];

  const getAmount=i=>{
    if(p==="annual"){
      if(typeof usage==="number") return usage;
      return usage?benefit.value:0;
    }
    const arr=Array.isArray(usage)?usage:new Array(pcount).fill(0);
    const v=arr[i];
    if(typeof v==="number") return v;
    return v?benefit.value:0;
  };

  const commit=i=>{
    const amt=Math.max(0,Math.min(Number(inputVal)||0,benefit.value));
    onSetAmount(i,amt);
    setEditing(null);
  };

  return(
    <div style={{marginTop:5}}>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"flex-start"}}>
        {labels.map((lbl,i)=>{
          const amt=getAmount(i);
          const full=amt>=benefit.value;
          const partial=amt>0&&!full;
          const isEd=editing===i;
          return(
            <div key={i} style={{display:"flex",flexDirection:"column",gap:3}}>
              <div onClick={e=>{e.stopPropagation();setEditing(isEd?null:i);setInputVal(String(amt));}} style={{
                padding:"3px 9px",borderRadius:6,fontSize:11,cursor:"pointer",fontWeight:600,
                background:full?C.green:partial?`${C.gold}33`:C.s3,
                border:`1px solid ${full?C.green+"55":partial?C.gold+"55":C.border2}`,
                color:full?"#000":partial?C.goldL:C.text2,transition:"all 0.15s"}}>
                {full?`${lbl} ✓`:partial?`${lbl} $${amt}`:lbl}
              </div>
              {isEd&&(
                <div style={{display:"flex",gap:4,alignItems:"center"}} onClick={e=>e.stopPropagation()}>
                  <input type="number" value={inputVal} onChange={e=>setInputVal(e.target.value)}
                    onBlur={()=>commit(i)}
                    onKeyDown={e=>{if(e.key==="Enter")commit(i);if(e.key==="Escape")setEditing(null);}}
                    autoFocus
                    style={{width:55,background:C.s2,border:`1px solid ${C.border2}`,borderRadius:6,
                      padding:"3px 6px",color:C.text,fontSize:11,outline:"none"}}/>
                  <span style={{fontSize:10,color:C.text3}}>/ ${benefit.value}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CARD DETAIL ───────────────────────────────────────────────────
function CardDetail({uc,onClose,onUpdate,onDelete,mlaGlobal}) {
  const card=DB[uc.cardId];
  const [tab,setTab]=useState("overview");
  const [spendVal,setSpendVal]=useState(String(uc.subSpend||0));
  const [subBonusVal,setSubBonusVal]=useState(String(uc.subBonus!=null?uc.subBonus:card?.sub.bonus||0));
  const [subTargetVal,setSubTargetVal]=useState(String(uc.subTarget!=null?uc.subTarget:card?.sub.spend||0));
  const [subMonthsVal,setSubMonthsVal]=useState(String(uc.subMonths!=null?uc.subMonths:card?.sub.months||0));
  const [editingSub,setEditingSub]=useState(false);
  const [nick,setNick]=useState(uc.nickname||"");
  const [bu,setBu]=useState(uc.benefitUsage||{});
  if(!card) return null;

  const isWaived=mlaGlobal&&card.mlaEligible;
  const off=calcOffset({...uc,benefitUsage:bu},mlaGlobal);
  const sub=subInfo(uc);
  const totalBV=card.benefits.reduce((s,b)=>s+bTotalValue(b),0);

  const setBenefitAmount=(id,idx,amt)=>{
    const b=card.benefits.find(x=>x.id===id);
    const next=bSetAmount(b,bu[id],idx,amt);
    const nextBu={...bu,[id]:next};
    setBu(nextBu);
    onUpdate({...uc,benefitUsage:nextBu,nickname:nick});
  };

  const saveSub=()=>onUpdate({...uc,subSpend:Number(spendVal)||0});
  const saveSubDetails=()=>{
    const bonus=Number(subBonusVal)||card.sub.bonus;
    const target=Number(subTargetVal)||card.sub.spend;
    const months=Number(subMonthsVal)||card.sub.months;
    onUpdate({...uc,subSpend:Number(spendVal)||0,subBonus:bonus,subTarget:target,subMonths:months});
  };
  const saveSettings=()=>{onUpdate({...uc,nickname:nick,benefitUsage:bu});onClose();};

  const TABS=[
    {id:"overview",label:"Overview"},
    {id:"benefits",label:`Benefits (${card.benefits.filter(b=>bTotalValue(b)>0).length})`},
    {id:"sub",label:"Sign-Up Bonus"},
    {id:"settings",label:"Settings"},
  ];

  return(
    <Overlay title={uc.nickname||card.short} onClose={onClose}>
      <div style={{padding:"20px 22px 0",display:"flex",justifyContent:"center"}}>
        <CardArt card={card} nickname={uc.nickname}/>
      </div>
      <div style={{display:"flex",gap:2,padding:"14px 22px 0",borderBottom:`1px solid ${C.border}`,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:tab===t.id?`${C.gold}18`:"transparent",
            border:tab===t.id?`1px solid ${C.gold}35`:"1px solid transparent",
            color:tab===t.id?C.gold:C.text2,
            borderRadius:"8px 8px 0 0",padding:"8px 12px",
            fontSize:12.5,fontWeight:tab===t.id?600:400,
            cursor:"pointer",marginBottom:-1,transition:"all 0.15s",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"18px 22px"}}>
        {tab==="overview"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:C.s2,borderRadius:14,padding:16,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:13,color:C.text2}}>Annual Fee Offset</span>
                {off.waived?<Pill color={C.green}>🎖 MLA Waived</Pill>:
                  <span style={{fontWeight:700,fontSize:13,color:off.pct>=100?C.green:C.goldL}}>
                    ${off.saved} / ${card.annualFee} recovered
                  </span>}
              </div>
              <Bar pct={off.pct}/>
              {!off.waived&&card.annualFee>0&&<div style={{marginTop:8,fontSize:12,color:C.text3}}>
                {off.pct>=100?`✓ Fully offset — saving $${off.saved-card.annualFee} extra`:`Effective annual fee: $${off.fee}`}
              </div>}
            </div>
            <div style={{fontSize:10.5,color:C.text3,fontWeight:600,letterSpacing:0.9,textTransform:"uppercase",marginBottom:-4}}>Earn Rates</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(118px,1fr))",gap:8}}>
              {Object.entries(CATS).map(([cat,meta])=>{
                const rate=card.rates[cat]??card.rates.other??1;
                const col=rate>=4?C.green:rate>=2?C.gold:C.text3;
                return(
                  <div key={cat} style={{background:C.s2,borderRadius:10,padding:"9px 12px",
                    display:"flex",justifyContent:"space-between",alignItems:"center",border:`1px solid ${C.border}`}}>
                    <span style={{fontSize:11.5,color:C.text2}}>{meta.icon} {meta.label}</span>
                    <span style={{fontWeight:700,fontSize:13.5,color:col}}>
                      {rate}{card.rewardType==="cashback"?"%":"x"}
                    </span>
                  </div>
                );
              })}
            </div>
            {totalBV>0&&(
              <div style={{background:`${C.gold}0D`,border:`1px solid ${C.gold}25`,
                borderRadius:12,padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12.5,color:C.text2}}>Total annual benefit value</span>
                <span style={{fontWeight:700,color:C.gold}}>${totalBV.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {tab==="benefits"&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {card.benefits.length===0&&(
              <div style={{color:C.text3,textAlign:"center",padding:"24px 0",fontSize:14}}>
                No trackable benefits for this card
              </div>
            )}
            {card.benefits.map(b=>{
              const p=b.period||"annual";
              const usage=bu[b.id];
              const usedV=bUsedValue(b,usage);
              const totalV=bTotalValue(b);
              const hasValue=totalV>0;
              const allUsed=hasValue&&usedV>=totalV;
              return(
                <div key={b.id} style={{
                  padding:"11px 13px",borderRadius:11,
                  background:allUsed?`${C.green}0C`:C.s2,
                  border:`1px solid ${allUsed?C.green+"33":C.border}`,transition:"all 0.15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1,fontSize:13,color:allUsed?C.green:C.text,fontWeight:500}}>{b.name}</div>
                    {hasValue?
                      <span style={{fontWeight:700,fontSize:12.5,color:allUsed?C.green:C.text2,flexShrink:0}}>
                        ${usedV}/${totalV}
                      </span>:
                      <Pill color={C.blue}>Access</Pill>}
                  </div>
                  {hasValue&&(
                    <PeriodChips benefit={b} usage={usage} onSetAmount={(idx,amt)=>setBenefitAmount(b.id,idx,amt)}/>
                  )}
                  {hasValue&&p!=="annual"&&(
                    <div style={{fontSize:10.5,color:C.text3,marginTop:4}}>
                      ${b.value}/{p==="monthly"?"mo":p==="quarterly"?"qtr":"half-yr"} · tap periods to mark used
                    </div>
                  )}
                </div>
              );
            })}
            {totalBV>0&&(
              <div style={{marginTop:4,background:`${C.gold}0D`,border:`1px solid ${C.gold}28`,
                borderRadius:11,padding:"11px 14px",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:12,color:C.text2}}>Total available value</span>
                <span style={{fontWeight:700,color:C.gold}}>${totalBV.toLocaleString()}/yr</span>
              </div>
            )}
          </div>
        )}

        {tab==="sub"&&!sub&&(
          <div style={{textAlign:"center",padding:"32px 0",color:C.text3,fontSize:13}}>
            No sign-up bonus tracked for this card.
          </div>
        )}
        {tab==="sub"&&sub&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:sub.done?`${C.green}0D`:C.s2,
              border:`1px solid ${sub.done?C.green+"30":C.border}`,borderRadius:14,padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:12,color:C.text2,marginBottom:4}}>Sign-Up Bonus</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600,color:C.gold}}>
                    {card.rewardType==="cashback"?`$${sub.bonus}`:`${sub.bonus.toLocaleString()} ${sub.currency}`}
                  </div>
                  <div style={{fontSize:12,color:C.text3,marginTop:3}}>
                    Spend ${sub.target.toLocaleString()} in {sub.months} months
                  </div>
                </div>
                {sub.done&&<Pill color={C.green}>✓ Threshold Met</Pill>}
              </div>
              <Bar pct={sub.pct} color={C.purple}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:7,fontSize:12}}>
                <span style={{color:C.text2}}>${sub.spend.toLocaleString()} spent</span>
                <span style={{color:sub.done?C.green:C.text3}}>
                  {sub.done?"🎉 Complete!":"$"+sub.remaining.toLocaleString()+" remaining"}
                </span>
              </div>
            </div>
            <div>
              <div style={{fontSize:10.5,color:C.text3,marginBottom:8,fontWeight:600,textTransform:"uppercase",letterSpacing:0.9}}>
                Update Spend Toward SUB
              </div>
              <div style={{display:"flex",gap:8}}>
                <Input value={spendVal} onChange={e=>setSpendVal(e.target.value)} type="number" placeholder="0"/>
                <Btn gold onClick={saveSub} style={{flexShrink:0,whiteSpace:"nowrap"}}>Save</Btn>
              </div>
            </div>
            <div style={{background:C.s2,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:editingSub?10:0}}>
                <div style={{fontSize:10.5,color:C.text3,fontWeight:600,textTransform:"uppercase",letterSpacing:0.9}}>
                  SUB Details
                </div>
                <button onClick={()=>setEditingSub(!editingSub)} style={{
                  background:editingSub?C.s3:"transparent",border:`1px solid ${C.border2}`,
                  borderRadius:7,padding:"3px 10px",fontSize:11,color:C.text2,cursor:"pointer",fontWeight:600}}>
                  {editingSub?"Cancel":"✎ Edit"}
                </button>
              </div>
              {editingSub&&(
                <>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                    <div>
                      <div style={{fontSize:11,color:C.text3,marginBottom:5}}>Bonus ({card.rewardType==="cashback"?"$":"pts"})</div>
                      <Input value={subBonusVal} onChange={e=>setSubBonusVal(e.target.value)} type="number"/>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:C.text3,marginBottom:5}}>Spend ($)</div>
                      <Input value={subTargetVal} onChange={e=>setSubTargetVal(e.target.value)} type="number"/>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:C.text3,marginBottom:5}}>Months</div>
                      <Input value={subMonthsVal} onChange={e=>setSubMonthsVal(e.target.value)} type="number"/>
                    </div>
                  </div>
                  <Btn gold onClick={()=>{saveSubDetails();setEditingSub(false);}} full>Save SUB Details</Btn>
                </>
              )}
            </div>
          </div>
        )}

        {tab==="settings"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <div style={{fontSize:10.5,color:C.text3,marginBottom:8,fontWeight:600,textTransform:"uppercase",letterSpacing:0.9}}>
                Card Nickname
              </div>
              <Input value={nick} onChange={e=>setNick(e.target.value)} placeholder="e.g. Business Platinum"/>
            </div>
            {isWaived&&(
              <div style={{background:`${C.green}0C`,border:`1px solid ${C.green}30`,borderRadius:12,
                padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>🎖</span>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.green}}>MLA Waiver Active (Account-Wide)</div>
                  <div style={{fontSize:11.5,color:C.text2,marginTop:2}}>Managed in Settings tab.</div>
                </div>
              </div>
            )}
            {!isWaived&&!card.mlaEligible&&(
              <div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:C.text3}}>
                  MLA waiver is not applicable (business card or ineligible issuer).
                </div>
              </div>
            )}
            <Btn gold onClick={saveSettings} full>Save Changes</Btn>
            <Btn danger onClick={()=>{
              if(window.confirm(`Remove ${card.short} from your wallet?`)){onDelete(uc.instanceId);onClose();}
            }} full>Remove This Card</Btn>
          </div>
        )}
      </div>
    </Overlay>
  );
}

// ── ADD CARD MODAL ────────────────────────────────────────────────
function AddCard({onClose,userCards,onAdd}) {
  const [q,setQ]=useState("");
  const [sel,setSel]=useState(null);
  const [nick,setNick]=useState("");
  const [noSub,setNoSub]=useState(false);
  const [subSpend,setSubSpend]=useState("0");
  const [subBonus,setSubBonus]=useState("");
  const [subTarget,setSubTarget]=useState("");
  const [subMonths,setSubMonths]=useState("");

  const selectCard=card=>{
    setSel(card);
    setNoSub(false);
    setSubBonus(String(card.sub.bonus));
    setSubTarget(String(card.sub.spend));
    setSubMonths(String(card.sub.months));
  };

  const results=useMemo(()=>{
    const lq=q.toLowerCase();
    return Object.values(DB).filter(c=>
      c.name.toLowerCase().includes(lq)||c.issuer.toLowerCase().includes(lq)||c.short.toLowerCase().includes(lq)
    );
  },[q]);

  const doAdd=()=>{
    try{
      if(noSub){
        onAdd({
          instanceId:uid(),cardId:sel.id,nickname:nick.trim(),
          noSub:true,subSpend:0,
          benefitUsage:{},mlaWaiver:false,
          addedDate:new Date().toISOString().slice(0,10)
        });
      } else {
        const bonus=Number(subBonus)||sel.sub.bonus;
        const target=Number(subTarget)||sel.sub.spend;
        const months=Number(subMonths)||sel.sub.months;
        const hasCustom=bonus!==sel.sub.bonus||target!==sel.sub.spend||months!==sel.sub.months;
        onAdd({
          instanceId:uid(),cardId:sel.id,nickname:nick.trim(),
          subSpend:Number(subSpend)||0,
          ...(hasCustom?{subBonus:bonus,subTarget:target,subMonths:months}:{}),
          benefitUsage:{},mlaWaiver:false,
          addedDate:new Date().toISOString().slice(0,10)
        });
      }
    }catch(e){console.error("AddCard error:",e);}
    onClose();
  };

  const FLabel=({children})=>(
    <div style={{fontSize:10.5,color:C.text3,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:0.9}}>{children}</div>
  );

  return(
    <Overlay title={sel?`Configure ${sel.short}`:"Add a Card"} onClose={onClose}>
      <div style={{padding:"14px 22px"}}>
        {!sel?(
          <>
            <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search cards..." style={{marginBottom:12}}/>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:420,overflowY:"auto"}}>
              {results.map(card=>{
                const count=userCards.filter(uc=>uc.cardId===card.id).length;
                return(
                  <div key={card.id} onClick={()=>selectCard(card)} style={{
                    display:"flex",alignItems:"center",gap:12,
                    background:C.s2,border:`1px solid ${C.border}`,
                    borderRadius:14,padding:"12px",cursor:"pointer",transition:"all 0.15s"}}>
                    <CardArt card={card} sm/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{card.name}</div>
                      <div style={{fontSize:11,color:C.text3,marginBottom:7}}>{card.issuer}</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {card.annualFee===0?<Pill color={C.green}>No AF</Pill>:<Pill color={C.red}>${card.annualFee}/yr</Pill>}
                        <Pill color={card.rewardType==="cashback"?C.green:C.blue}>{card.rewardType}</Pill>
                        {count>0&&<Pill color={C.purple}>{count} in wallet</Pill>}
                      </div>
                    </div>
                    <span style={{color:C.text3,fontSize:18}}>›</span>
                  </div>
                );
              })}
              {results.length===0&&<div style={{textAlign:"center",color:C.text3,padding:"24px 0"}}>No cards found</div>}
            </div>
          </>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",justifyContent:"center"}}>
              <CardArt card={sel} nickname={nick}/>
            </div>
            <div>
              <FLabel>Nickname (optional)</FLabel>
              <Input value={nick} onChange={e=>setNick(e.target.value)} placeholder="e.g. Work Card"/>
            </div>
            <div style={{background:C.s2,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:noSub?0:12}}>
                <FLabel>Sign-Up Bonus</FLabel>
                <div onClick={()=>setNoSub(!noSub)} style={{
                  display:"flex",alignItems:"center",gap:7,cursor:"pointer",userSelect:"none",marginBottom:6}}>
                  <div style={{width:38,height:21,borderRadius:11,
                    background:noSub?C.red:C.s3,border:`1px solid ${C.border2}`,
                    position:"relative",transition:"background 0.2s",flexShrink:0}}>
                    <div style={{width:15,height:15,borderRadius:8,background:"#fff",
                      position:"absolute",top:2,left:noSub?20:3,transition:"left 0.2s"}}/>
                  </div>
                  <span style={{fontSize:11,color:noSub?C.red:C.text3,fontWeight:600}}>No SUB</span>
                </div>
              </div>
              {!noSub&&(
                <>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    <div>
                      <div style={{fontSize:11,color:C.text3,marginBottom:5}}>
                        Bonus ({sel.rewardType==="cashback"?"$":"pts"})
                      </div>
                      <Input value={subBonus} onChange={e=>setSubBonus(e.target.value)} type="number"/>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:C.text3,marginBottom:5}}>Spend ($)</div>
                      <Input value={subTarget} onChange={e=>setSubTarget(e.target.value)} type="number"/>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:C.text3,marginBottom:5}}>Months</div>
                      <Input value={subMonths} onChange={e=>setSubMonths(e.target.value)} type="number"/>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:C.text3,marginBottom:5}}>Current Spend Toward SUB ($)</div>
                    <Input value={subSpend} onChange={e=>setSubSpend(e.target.value)} type="number" placeholder="0"/>
                  </div>
                </>
              )}
            </div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <Btn ghost onClick={()=>setSel(null)} style={{flex:1}}>← Back</Btn>
              <Btn gold onClick={doAdd} style={{flex:2}}>Add to Wallet</Btn>
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

// ── POOLED BENEFITS ───────────────────────────────────────────────
function PooledBenefits({cards,onUpdateCard}) {
  const [expanded,setExpanded]=useState(null);

  const groups=useMemo(()=>{
    const map={};
    cards.forEach(uc=>{
      const card=DB[uc.cardId]; if(!card) return;
      card.benefits.forEach(b=>{
        if(!b.value) return;
        const key=b.group||`${uc.cardId}__${b.id}`;
        if(!map[key]) map[key]={key,name:b.name,period:b.period||"annual",valuePerPeriod:b.value,instances:[]};
        map[key].instances.push({uc,b,card});
      });
    });
    return Object.values(map).sort((a,b)=>b.instances.length-a.instances.length);
  },[cards]);

  const setPeriodAmount=(uc,b,idx,amt)=>{
    const next=bSetAmount(b,uc.benefitUsage?.[b.id],idx,amt);
    onUpdateCard({...uc,benefitUsage:{...(uc.benefitUsage||{}),[b.id]:next}});
  };

  if(groups.length===0)
    return<div style={{textAlign:"center",padding:"40px 0",color:C.text3}}>No trackable benefits yet</div>;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:12,color:C.text3,marginBottom:2,paddingLeft:2}}>
        Benefits with the same name are pooled across cards. Tap to expand and mark per-card usage.
      </div>
      {groups.map(g=>{
        const pcount=PCOUNT[g.period];
        const totalAnnual=g.valuePerPeriod*pcount*g.instances.length;
        const totalUsed=g.instances.reduce((s,{uc,b})=>s+bUsedValue(b,uc.benefitUsage?.[b.id]),0);
        const pct=totalAnnual>0?(totalUsed/totalAnnual)*100:0;
        const isExp=expanded===g.key;

        return(
          <div key={g.key} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
            <div onClick={()=>setExpanded(isExp?null:g.key)} style={{
              padding:"13px 16px",cursor:"pointer",
              background:isExp?"rgba(255,255,255,0.02)":"transparent",
              display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{g.name}</div>
                <div style={{fontSize:11,color:C.text3}}>
                  {g.instances.length} card{g.instances.length!==1?"s":""} ·{" "}
                  ${g.valuePerPeriod}/{g.period==="monthly"?"mo":g.period==="quarterly"?"qtr":g.period==="semiannual"?"half-yr":"yr"}
                </div>
                <div style={{marginTop:6}}><Bar pct={pct} h={4}/></div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,color:C.gold}}>
                  ${totalAnnual.toLocaleString()}
                </div>
                <div style={{fontSize:11,color:pct>0?C.green:C.text3}}>${totalUsed} used</div>
              </div>
              <div style={{color:C.text3,fontSize:14,flexShrink:0,
                transform:isExp?"rotate(90deg)":"none",transition:"transform 0.15s"}}>›</div>
            </div>

            {isExp&&g.instances.map(({uc,b,card})=>{
              const usage=uc.benefitUsage?.[b.id];
              const usedV=bUsedValue(b,usage);
              const totalV=bTotalValue(b);
              const allUsed=usedV>=totalV;
              return(
                <div key={uc.instanceId} style={{
                  padding:"10px 16px",borderTop:`1px solid ${C.border}`,
                  background:allUsed?`${C.green}08`:"transparent"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <CardArt card={card} sm nickname={uc.nickname}/>
                      <div>
                        <div style={{fontSize:12,fontWeight:500}}>{uc.nickname||card.short}</div>
                        <div style={{fontSize:10.5,color:C.text3}}>{card.issuer}</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:allUsed?C.green:C.text3,fontWeight:600}}>
                      ${usedV} / ${totalV}
                    </div>
                  </div>
                  <PeriodChips benefit={b} usage={usage} onSetAmount={(idx,amt)=>setPeriodAmount(uc,b,idx,amt)}/>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────
export default function App() {
  const [cards,setCards]=useStored("cardvault_v2",[]);
  const [mlaGlobal,setMlaGlobal]=useStored("cardvault_mla",false);
  const [tab,setTab]=useState("dashboard");
  const [benefitSubTab,setBenefitSubTab]=useState("bycard");
  const [subTrackTab,setSubTrackTab]=useState("ongoing");
  const [selId,setSelId]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [bestCat,setBestCat]=useState("dining");

  const sel=cards.find(uc=>uc.instanceId===selId);
  const updateCard=u=>setCards(cards.map(c=>c.instanceId===u.instanceId?u:c));
  const deleteCard=id=>setCards(cards.filter(c=>c.instanceId!==id));
  const addCard=c=>setCards([...cards,c]);

  const totalAF=useMemo(()=>cards.reduce((s,uc)=>{
    if((mlaGlobal&&DB[uc.cardId]?.mlaEligible)||uc.mlaWaiver) return s;
    return s+(DB[uc.cardId]?.annualFee||0);
  },0),[cards,mlaGlobal]);

  const totalSaved=useMemo(()=>cards.reduce((s,uc)=>s+calcOffset(uc,mlaGlobal).saved,0),[cards,mlaGlobal]);
  const offsetPct=totalAF>0?Math.min(100,(totalSaved/totalAF)*100):0;

  const totalPool=useMemo(()=>cards.reduce((s,uc)=>{
    const card=DB[uc.cardId]; if(!card) return s;
    return s+card.benefits.reduce((a,b)=>a+bTotalValue(b),0);
  },0),[cards]);

  const totalRedeemed=useMemo(()=>cards.reduce((s,uc)=>{
    const card=DB[uc.cardId]; if(!card) return s;
    return s+card.benefits.reduce((a,b)=>a+bUsedValue(b,uc.benefitUsage?.[b.id]),0);
  },0),[cards]);

  const catRank=useMemo(()=>cards.map(uc=>{
    const card=DB[uc.cardId]; if(!card) return null;
    return{uc,card,rate:card.rates[bestCat]??card.rates.other??1};
  }).filter(Boolean).sort((a,b)=>b.rate-a.rate),[cards,bestCat]);

  const subGroups=useMemo(()=>{
    const ongoing=[],completed=[],nosub=[];
    cards.forEach(uc=>{
      const card=DB[uc.cardId]; if(!card) return;
      if(uc.noSub){nosub.push({uc,card});return;}
      const sub=subInfo(uc);
      if(!sub){nosub.push({uc,card});return;}
      if(sub.done) completed.push({uc,card,sub});
      else ongoing.push({uc,card,sub});
    });
    return{ongoing,completed,nosub};
  },[cards]);

  const hasCards=cards.length>0;
  const NAV=[["dashboard","Overview"],["cards","My Cards"],["benefits","Benefits"],["subs","Sign-Up Bonuses"],["settings","Settings"]];

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${C.s3};border-radius:2px;}
        @keyframes popIn{from{opacity:0;transform:scale(0.96) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .fu{animation:fadeUp 0.3s ease both;}
        .hl{transition:transform 0.2s,box-shadow 0.2s;cursor:pointer;}
        .hl:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.4)!important;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        select option{background:${C.s2};}
        button:focus{outline:none;}
      `}</style>

      <div style={{minHeight:"100vh",background:C.bg,paddingBottom:60}}>

        {/* HEADER */}
        <div style={{background:`linear-gradient(180deg,rgba(201,168,76,0.05),transparent)`,borderBottom:`1px solid ${C.border}`}}>
          <div style={{maxWidth:680,margin:"0 auto",padding:"18px 20px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,letterSpacing:-0.5,color:C.text}}>CardVault</div>
                <div style={{fontSize:11,color:C.text3,marginTop:1}}>
                  Your wallet, optimized{mlaGlobal&&<span style={{color:C.green,marginLeft:8}}>🎖 MLA Active</span>}
                </div>
              </div>
              <button onClick={()=>setShowAdd(true)} style={{
                background:`linear-gradient(135deg,${C.gold},${C.goldL})`,color:"#1a1204",
                border:"none",borderRadius:11,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Add Card</button>
            </div>
            <div style={{display:"flex",gap:2,overflowX:"auto"}}>
              {NAV.map(([id,lbl])=>(
                <button key={id} onClick={()=>setTab(id)} style={{
                  background:tab===id?`${C.gold}15`:"transparent",
                  border:tab===id?`1px solid ${C.gold}30`:"1px solid transparent",
                  color:tab===id?C.gold:C.text2,
                  borderRadius:"9px 9px 0 0",padding:"9px 18px",
                  fontSize:13,fontWeight:tab===id?600:400,
                  cursor:"pointer",marginBottom:-1,transition:"all 0.15s",whiteSpace:"nowrap"}}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{maxWidth:680,margin:"0 auto",padding:"22px 20px 60px"}}>

          {/* ── DASHBOARD ── */}
          {tab==="dashboard"&&(
            <div className="fu" style={{display:"flex",flexDirection:"column",gap:18}}>
              {!hasCards?(
                <div style={{textAlign:"center",padding:"64px 20px",
                  background:`${C.gold}08`,border:`1px dashed ${C.gold}30`,borderRadius:20}}>
                  <div style={{fontSize:42,marginBottom:12}}>💳</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,marginBottom:8}}>Your wallet is empty</div>
                  <div style={{color:C.text3,fontSize:14,marginBottom:20}}>
                    Add your first card to start tracking benefits and optimizing your spend
                  </div>
                  <button onClick={()=>setShowAdd(true)} style={{
                    background:`linear-gradient(135deg,${C.gold},${C.goldL})`,color:"#1a1204",
                    border:"none",borderRadius:12,padding:"11px 24px",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                    Add Your First Card
                  </button>
                </div>
              ):(
                <>
                  <div style={{display:"flex",gap:10}}>
                    <Stat label="Annual Fees" value={`$${totalAF.toLocaleString()}`} color={C.red}/>
                    <Stat label="Benefits Used" value={`$${totalRedeemed.toLocaleString()}`} color={C.green}/>
                    <Stat label="Fee Offset" value={`${Math.round(offsetPct)}%`} color={C.gold} sub={`${cards.length} card${cards.length!==1?"s":""}`}/>
                  </div>
                  <div style={{background:`${C.gold}0C`,border:`1px solid ${C.gold}25`,
                    borderRadius:16,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:12,color:C.text2,marginBottom:4}}>Total Annual Benefit Value Available</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,color:C.gold}}>
                        ${totalPool.toLocaleString()}
                      </div>
                    </div>
                    <span style={{fontSize:30}}>✨</span>
                  </div>

                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px 18px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600}}>Best Card For...</div>
                      <select value={bestCat} onChange={e=>setBestCat(e.target.value)} style={{
                        background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,
                        padding:"6px 10px",color:C.text,fontSize:12.5,cursor:"pointer",outline:"none"}}>
                        {Object.entries(CATS).map(([k,v])=>(
                          <option key={k} value={k}>{v.icon} {v.label}</option>
                        ))}
                      </select>
                    </div>
                    {catRank.map(({uc,card,rate},i)=>(
                      <div key={uc.instanceId} onClick={()=>setSelId(uc.instanceId)} className="hl" style={{
                        display:"flex",alignItems:"center",gap:10,padding:"9px 11px",
                        borderRadius:11,marginBottom:i<catRank.length-1?6:0,
                        background:i===0?`${C.gold}0E`:"transparent",
                        border:`1px solid ${i===0?C.gold+"28":"transparent"}`}}>
                        <div style={{width:24,height:24,borderRadius:7,flexShrink:0,
                          background:i===0?`linear-gradient(135deg,${C.gold},${C.goldL})`:C.s3,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:11,fontWeight:700,color:i===0?"#1a1204":C.text3}}>
                          #{i+1}
                        </div>
                        <CardArt card={card} sm nickname={uc.nickname}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:500}}>{uc.nickname||card.short}</div>
                          <div style={{fontSize:11,color:C.text3}}>{card.currency}</div>
                        </div>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:600,color:i===0?C.gold:C.text2}}>
                          {rate}{card.rewardType==="cashback"?"%":"x"}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,marginBottom:-6}}>
                    Annual Fee Offset Tracker
                  </div>
                  {cards.map(uc=>{
                    const card=DB[uc.cardId]; if(!card) return null;
                    const off=calcOffset(uc,mlaGlobal);
                    return(
                      <div key={uc.instanceId} onClick={()=>setSelId(uc.instanceId)} style={{
                        background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 15px"}} className="hl">
                        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:(!off.waived&&card.annualFee>0)?12:0}}>
                          <CardArt card={card} sm nickname={uc.nickname}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:14,fontWeight:500}}>{uc.nickname||card.short}</div>
                            <div style={{fontSize:11,color:C.text3,marginTop:1}}>{card.issuer}</div>
                          </div>
                          {off.waived?<Pill color={C.green}>🎖 MLA Waived</Pill>:
                            card.annualFee===0?<Pill color={C.green}>No Annual Fee</Pill>:
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:11,color:C.text3}}>effective AF</div>
                              <div style={{fontSize:15,fontWeight:700,color:off.pct>=100?C.green:C.goldL}}>
                                {off.pct>=100?`+$${off.saved-card.annualFee}`:`$${off.fee}`}
                              </div>
                            </div>}
                        </div>
                        {!off.waived&&card.annualFee>0&&<>
                          <Bar pct={off.pct}/>
                          <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:11,color:C.text3}}>
                            <span>${off.saved} recovered</span><span>${card.annualFee} AF</span>
                          </div>
                        </>}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ── MY CARDS ── */}
          {tab==="cards"&&(
            <div className="fu" style={{display:"flex",flexDirection:"column",gap:12}}>
              {!hasCards?(
                <div style={{textAlign:"center",padding:"60px 0"}}>
                  <div style={{color:C.text3,marginBottom:16}}>No cards in your wallet yet</div>
                  <Btn gold onClick={()=>setShowAdd(true)}>Add a Card</Btn>
                </div>
              ):cards.map((uc,i)=>{
                const card=DB[uc.cardId]; if(!card) return null;
                const off=calcOffset(uc,mlaGlobal),sub=subInfo(uc);
                const totalBV=card.benefits.reduce((s,b)=>s+bTotalValue(b),0);
                const usedBV=card.benefits.reduce((s,b)=>s+bUsedValue(b,uc.benefitUsage?.[b.id]),0);
                return(
                  <div key={uc.instanceId} onClick={()=>setSelId(uc.instanceId)} style={{
                    background:C.surface,border:`1px solid ${C.border}`,
                    borderRadius:18,padding:16,animationDelay:`${i*0.05}s`}} className="hl fu">
                    <div style={{display:"flex",gap:14,marginBottom:12}}>
                      <CardArt card={card} nickname={uc.nickname}/>
                      <div style={{flex:1,minWidth:0,paddingTop:2}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,marginBottom:2}}>
                          {uc.nickname||card.short}
                        </div>
                        <div style={{fontSize:11.5,color:C.text3,marginBottom:8}}>{card.issuer}</div>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                          {off.waived?<Pill color={C.green}>🎖 MLA</Pill>:
                            card.annualFee===0?<Pill color={C.green}>$0 AF</Pill>:
                            <Pill color={C.red}>${card.annualFee}/yr</Pill>}
                          <Pill color={card.rewardType==="cashback"?C.green:C.blue}>{card.rewardType}</Pill>
                          {sub?.done&&<Pill color={C.green}>✓ SUB</Pill>}
                          {sub&&!sub.done&&sub.spend>0&&<Pill color={C.purple}>${sub.remaining.toLocaleString()} to SUB</Pill>}
                        </div>
                      </div>
                    </div>
                    {totalBV>0&&(
                      <div style={{marginBottom:sub&&!sub.done&&sub.target>0?10:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.text3,marginBottom:4}}>
                          <span>Benefits redeemed</span><span>${usedBV} / ${totalBV}</span>
                        </div>
                        <Bar pct={totalBV>0?(usedBV/totalBV)*100:0}/>
                      </div>
                    )}
                    {sub&&!sub.done&&sub.target>0&&(
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.text3,marginBottom:4}}>
                          <span>SUB progress</span><span>${sub.spend.toLocaleString()} / ${sub.target.toLocaleString()}</span>
                        </div>
                        <Bar pct={sub.pct} color={C.purple}/>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── BENEFITS ── */}
          {tab==="benefits"&&(
            <div className="fu" style={{display:"flex",flexDirection:"column",gap:16}}>
              {!hasCards?(
                <div style={{textAlign:"center",padding:"60px 0",color:C.text3}}>Add cards to track benefits</div>
              ):(
                <>
                  <div style={{display:"flex",gap:10}}>
                    <Stat label="Benefit Pool" value={`$${totalPool.toLocaleString()}`} color={C.gold}/>
                    <Stat label="Redeemed" value={`$${totalRedeemed.toLocaleString()}`} color={C.green}
                      sub={totalPool>0?`${Math.round((totalRedeemed/totalPool)*100)}% utilized`:undefined}/>
                  </div>
                  <div style={{display:"flex",gap:2,borderBottom:`1px solid ${C.border}`,marginBottom:4}}>
                    {[["bycard","By Card"],["pooled","Pooled"]].map(([id,lbl])=>(
                      <button key={id} onClick={()=>setBenefitSubTab(id)} style={{
                        background:benefitSubTab===id?`${C.blue}15`:"transparent",
                        border:benefitSubTab===id?`1px solid ${C.blue}30`:"1px solid transparent",
                        color:benefitSubTab===id?C.blue:C.text2,
                        borderRadius:"8px 8px 0 0",padding:"7px 16px",
                        fontSize:12.5,fontWeight:benefitSubTab===id?600:400,
                        cursor:"pointer",marginBottom:-1,transition:"all 0.15s"}}>{lbl}</button>
                    ))}
                  </div>
                  {benefitSubTab==="bycard"&&cards.map(uc=>{
                    const card=DB[uc.cardId];
                    if(!card||card.benefits.length===0) return null;
                    return(
                      <div key={uc.instanceId} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden"}}>
                        <div style={{padding:"11px 14px",display:"flex",alignItems:"center",gap:10,
                          borderBottom:`1px solid ${C.border}`,background:"rgba(255,255,255,0.02)"}}>
                          <CardArt card={card} sm nickname={uc.nickname}/>
                          <div>
                            <div style={{fontSize:13,fontWeight:600}}>{uc.nickname||card.short}</div>
                            <div style={{fontSize:11,color:C.text3}}>{card.issuer}</div>
                          </div>
                        </div>
                        <div style={{padding:"6px 12px"}}>
                          {card.benefits.map((b,i)=>{
                            const usage=uc.benefitUsage?.[b.id];
                            const usedV=bUsedValue(b,usage);
                            const totalV=bTotalValue(b);
                            const allUsed=totalV>0&&usedV>=totalV;
                            return(
                              <div key={b.id} style={{padding:"9px 3px",borderBottom:i<card.benefits.length-1?`1px solid ${C.border}`:"none"}}>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <div style={{flex:1,fontSize:13,color:allUsed?C.green:C.text}}>{b.name}</div>
                                  {totalV>0?
                                    <span style={{fontWeight:600,fontSize:12.5,color:allUsed?C.green:C.text2,flexShrink:0}}>
                                      ${usedV}/${totalV}
                                    </span>:
                                    <Pill color={C.blue}>Access</Pill>}
                                </div>
                                {totalV>0&&(
                                  <PeriodChips benefit={b} usage={usage} onSetAmount={(idx,amt)=>{
                                    const next=bSetAmount(b,usage,idx,amt);
                                    updateCard({...uc,benefitUsage:{...(uc.benefitUsage||{}),[b.id]:next}});
                                  }}/>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {benefitSubTab==="pooled"&&(
                    <PooledBenefits cards={cards} onUpdateCard={updateCard}/>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── SIGN-UP BONUSES ── */}
          {tab==="subs"&&(
            <div className="fu" style={{display:"flex",flexDirection:"column",gap:16}}>
              {!hasCards?(
                <div style={{textAlign:"center",padding:"60px 0",color:C.text3}}>Add cards to track sign-up bonuses</div>
              ):(
                <>
                  <div style={{display:"flex",gap:2,borderBottom:`1px solid ${C.border}`,marginBottom:4}}>
                    {[["ongoing","Ongoing"],["completed","Completed"],["nosub","No SUB"]].map(([id,lbl])=>{
                      const count=subGroups[id]?.length||0;
                      return(
                        <button key={id} onClick={()=>setSubTrackTab(id)} style={{
                          background:subTrackTab===id?`${C.purple}15`:"transparent",
                          border:subTrackTab===id?`1px solid ${C.purple}30`:"1px solid transparent",
                          color:subTrackTab===id?C.purple:C.text2,
                          borderRadius:"8px 8px 0 0",padding:"7px 14px",
                          fontSize:12.5,fontWeight:subTrackTab===id?600:400,
                          cursor:"pointer",marginBottom:-1,transition:"all 0.15s",whiteSpace:"nowrap"}}>
                          {lbl}{count>0&&<span style={{marginLeft:5,fontSize:10,opacity:0.7}}>({count})</span>}
                        </button>
                      );
                    })}
                  </div>

                  {subTrackTab==="ongoing"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {subGroups.ongoing.length===0?(
                        <div style={{textAlign:"center",padding:"40px 0",color:C.text3,fontSize:13}}>
                          No ongoing sign-up bonuses
                        </div>
                      ):subGroups.ongoing.map(({uc,card,sub})=>(
                        <div key={uc.instanceId} onClick={()=>setSelId(uc.instanceId)} className="hl" style={{
                          background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px 16px"}}>
                          <div style={{display:"flex",gap:12,marginBottom:12}}>
                            <CardArt card={card} sm nickname={uc.nickname}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{uc.nickname||card.short}</div>
                              <div style={{fontSize:11,color:C.text3,marginBottom:6}}>{card.issuer}</div>
                              <Pill color={C.purple}>
                                {card.rewardType==="cashback"?`$${sub.bonus.toLocaleString()}`:`${sub.bonus.toLocaleString()} ${sub.currency}`}
                              </Pill>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontSize:11,color:C.text3}}>spent</div>
                              <div style={{fontSize:16,fontWeight:700,color:C.text}}>${sub.spend.toLocaleString()}</div>
                              <div style={{fontSize:10,color:C.text3}}>of ${sub.target.toLocaleString()}</div>
                            </div>
                          </div>
                          <Bar pct={sub.pct} color={C.purple}/>
                          <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11}}>
                            <span style={{color:C.text3}}>{Math.round(sub.pct)}% complete</span>
                            <span style={{color:C.purple,fontWeight:600}}>${sub.remaining.toLocaleString()} remaining</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {subTrackTab==="completed"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {subGroups.completed.length===0?(
                        <div style={{textAlign:"center",padding:"40px 0",color:C.text3,fontSize:13}}>
                          No completed sign-up bonuses yet
                        </div>
                      ):subGroups.completed.map(({uc,card,sub})=>(
                        <div key={uc.instanceId} onClick={()=>setSelId(uc.instanceId)} className="hl" style={{
                          background:`${C.green}08`,border:`1px solid ${C.green}30`,borderRadius:16,padding:"14px 16px"}}>
                          <div style={{display:"flex",gap:12,marginBottom:10}}>
                            <CardArt card={card} sm nickname={uc.nickname}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{uc.nickname||card.short}</div>
                              <div style={{fontSize:11,color:C.text3,marginBottom:6}}>{card.issuer}</div>
                              <Pill color={C.green}>✓ SUB Complete</Pill>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:600,color:C.green}}>
                                {card.rewardType==="cashback"?`$${sub.bonus.toLocaleString()}`:`${sub.bonus.toLocaleString()}`}
                              </div>
                              <div style={{fontSize:10,color:C.text3}}>{card.rewardType==="cashback"?"cash back":sub.currency}</div>
                            </div>
                          </div>
                          <Bar pct={100} color={C.green}/>
                          <div style={{fontSize:11,color:C.green,marginTop:5,textAlign:"right",fontWeight:600}}>
                            🎉 Threshold met
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {subTrackTab==="nosub"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {subGroups.nosub.length===0?(
                        <div style={{textAlign:"center",padding:"40px 0",color:C.text3,fontSize:13}}>
                          All your cards have sign-up bonuses tracked
                        </div>
                      ):subGroups.nosub.map(({uc,card})=>(
                        <div key={uc.instanceId} onClick={()=>setSelId(uc.instanceId)} className="hl" style={{
                          background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:12}}>
                            <CardArt card={card} sm nickname={uc.nickname}/>
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:600}}>{uc.nickname||card.short}</div>
                              <div style={{fontSize:11,color:C.text3}}>{card.issuer}</div>
                            </div>
                            <Pill color={C.text3}>No SUB</Pill>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab==="settings"&&(
            <div className="fu" style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:600,marginBottom:-4}}>
                Account Settings
              </div>
              <div style={{background:mlaGlobal?`${C.green}08`:C.surface,
                border:`1px solid ${mlaGlobal?C.green+"40":C.border}`,borderRadius:16,padding:"16px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>🎖 Military Lending Act (MLA) Waiver</div>
                    <div style={{fontSize:13,color:C.text2,lineHeight:1.6}}>
                      When enabled, annual fees are automatically waived for all eligible cards — American Express personal
                      cards, Chase personal cards, Capital One personal cards, and Citi personal cards. Business cards
                      (Ink series) and select issuers (e.g. Wells Fargo) are not eligible.
                    </div>
                  </div>
                  <Toggle on={mlaGlobal} onToggle={()=>setMlaGlobal(!mlaGlobal)}/>
                </div>
                {hasCards&&(
                  <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                    <div style={{fontSize:11,color:C.text3,fontWeight:600,textTransform:"uppercase",letterSpacing:0.9,marginBottom:8}}>
                      Cards in your wallet
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {cards.map(uc=>{
                        const card=DB[uc.cardId]; if(!card) return null;
                        return(
                          <div key={uc.instanceId} style={{
                            display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:9,
                            background:card.mlaEligible&&mlaGlobal?`${C.green}0C`:C.s2,
                            border:`1px solid ${card.mlaEligible&&mlaGlobal?C.green+"25":C.border}`}}>
                            <CardArt card={card} sm nickname={uc.nickname}/>
                            <div style={{flex:1}}>
                              <div style={{fontSize:12,fontWeight:500}}>{uc.nickname||card.short}</div>
                              <div style={{fontSize:10.5,color:C.text3}}>{card.issuer}</div>
                            </div>
                            {card.mlaEligible?
                              <Pill color={mlaGlobal?C.green:C.text3}>{mlaGlobal?"✓ Waived":"Eligible"}</Pill>:
                              <Pill color={C.text3}>Not eligible</Pill>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div style={{background:C.s2,borderRadius:12,padding:"13px 15px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:12.5,color:C.text2,lineHeight:1.7}}>
                  <strong style={{color:C.text}}>About MLA eligibility:</strong> Under the Military Lending Act,
                  active-duty servicemembers and their dependents may have annual fees waived on personal credit cards
                  from participating issuers. This generally covers Amex, Chase, Citi, and Capital One for personal
                  cards only. Business cards are excluded. Verify eligibility with each issuer.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {sel&&<CardDetail uc={sel} onClose={()=>setSelId(null)} onUpdate={updateCard} onDelete={deleteCard} mlaGlobal={mlaGlobal}/>}
      {showAdd&&<AddCard onClose={()=>{setShowAdd(false);setTab("dashboard");}} userCards={cards} onAdd={addCard}/>}
    </>
  );
}
