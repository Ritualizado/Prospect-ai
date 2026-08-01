import { useState, useCallback, useMemo } from "react";

const ADJUSTER_PROSPECTS = [
  {
    id:"adj1", companyName:"Kent & Essex Mutual Insurance", contactName:"Claims Department",
    title:"Claims Manager", email:"claims@kentessexmutual.com", phone:"(519) 352-3730",
    website:"kentessexmutual.com", industry:"Insurance", location:"Chatham, ON",
    employees:"10–50", revenue:"$2M–$5M CAD", founded:"1882", score:88,
    tags:["Mutual","Local","Claims"], linkedin:"", twitter:"", instagram:"",
    summary:"Long-standing regional mutual insurer serving Chatham-Kent. Strong community ties and local claims processing make them an ideal referral partner."
  },
  {
    id:"adj2", companyName:"Maple Mutual Insurance (My Insurance My Way)", contactName:"Claims Department",
    title:"Claims Adjuster", email:"info@maplemutual.ca", phone:"(519) 354-1000",
    website:"maplemutual.ca", industry:"Insurance", location:"Chatham-Kent, ON",
    employees:"10–50", revenue:"$1M–$3M CAD", founded:"1921", score:82,
    tags:["Mutual","Regional","Auto"], linkedin:"", twitter:"", instagram:"",
    summary:"Ontario-based mutual insurer with a strong regional presence. Focuses on personal lines and farm insurance across Southwestern Ontario."
  },
  {
    id:"adj3", companyName:"Kernaghan Adjusters", contactName:"Dennis Schembri",
    title:"VP Ontario", email:"dschembri@kernaghan.com", phone:"(519) 258-9200",
    website:"kernaghan.com", industry:"Insurance Adjusting", location:"Windsor, ON",
    employees:"50–200", revenue:"$5M–$15M CAD", founded:"1952", score:91,
    tags:["Independent","Catastrophe","Commercial"], linkedin:"linkedin.com/in/dschembri", twitter:"", instagram:"",
    summary:"One of Canada's largest independent adjusting firms. Kernaghan handles complex commercial and catastrophe claims across Ontario — high-value referral potential."
  },
  {
    id:"adj4", companyName:"ClaimsPro – Windsor/Sarnia", contactName:"Branch Manager",
    title:"Office Manager", email:"windsor@claimspro.ca", phone:"(519) 971-9700",
    website:"claimspro.ca", industry:"Insurance Adjusting", location:"Windsor, ON",
    employees:"50–200", revenue:"$5M–$20M CAD", founded:"1986", score:85,
    tags:["National","Commercial","Property"], linkedin:"", twitter:"", instagram:"",
    summary:"National third-party adjusting firm with SW Ontario branches. Handles high volumes of property and liability claims for major insurers."
  },
  {
    id:"adj5", companyName:"Salus Mutual Insurance", contactName:"Claims Department",
    title:"Claims Representative", email:"info@salusmutual.ca", phone:"(519) 787-9000",
    website:"salusmutual.ca", industry:"Insurance", location:"Woodstock, ON",
    employees:"10–50", revenue:"$2M–$5M CAD", founded:"1883", score:78,
    tags:["Mutual","Farm","Property"], linkedin:"", twitter:"", instagram:"",
    summary:"Heritage mutual insurer serving rural and agricultural policyholders. Growing claims volume creates opportunity for restoration and inspection partnerships."
  },
  {
    id:"adj6", companyName:"BrokerLink Chatham", contactName:"Branch Manager",
    title:"Commercial Lines Manager", email:"chatham@brokerlink.ca", phone:"(519) 354-8111",
    website:"brokerlink.ca", industry:"Insurance Brokerage", location:"Chatham, ON",
    employees:"10–50", revenue:"$2M–$8M CAD", founded:"1901", score:80,
    tags:["Brokerage","Commercial","Personal"], linkedin:"", twitter:"", instagram:"",
    summary:"Major national brokerage with Chatham presence. Handles commercial and personal lines — referral relationship can drive steady claims volume."
  }
];
 
const RESTORATION_PROSPECTS = [
  {
    id:"res1", companyName:"First Onsite – Chatham/Kent", contactName:"Branch Manager",
    title:"Regional Operations Manager", email:"info@firstonsite.ca", phone:"(519) 380-0006",
    website:"firstonsite.ca", industry:"Property Restoration", location:"Chatham-Kent, ON",
    employees:"50–200", revenue:"$5M–$20M CAD", founded:"2001", score:90,
    tags:["National","Emergency","Commercial"], linkedin:"", twitter:"", instagram:"",
    summary:"One of Canada's largest restoration contractors. First Onsite handles large-loss commercial and residential restoration — strong co-referral potential with adjusters."
  },
  {
    id:"res2", companyName:"ServiceMaster Clean – Chatham, Windsor & Sarnia", contactName:"Owner",
    title:"Franchise Owner", email:"info@servicemasterchatham.ca", phone:"(519) 351-2200",
    website:"servicemaster.ca", industry:"Property Restoration", location:"Chatham, ON",
    employees:"10–50", revenue:"$1M–$3M CAD", founded:"1994", score:84,
    tags:["Franchise","Residential","Mould"], linkedin:"", twitter:"", instagram:"",
    summary:"Franchise restoration operator covering Chatham, Windsor, and Sarnia markets. Active in water, fire, and mould remediation for residential and light commercial."
  },
  {
    id:"res3", companyName:"ServiceMaster Restore – Windsor", contactName:"Operations Manager",
    title:"Operations Manager", email:"windsor@servicemasterrestore.ca", phone:"(519) 966-4046",
    website:"servicemasterrestore.ca", industry:"Property Restoration", location:"Windsor, ON",
    employees:"10–50", revenue:"$2M–$5M CAD", founded:"1991", score:81,
    tags:["Franchise","Fire","Water"], linkedin:"", twitter:"", instagram:"",
    summary:"Separate ServiceMaster Restore franchise focused on Windsor metro. Active insurer-direct billing and strong emergency response capacity."
  },
  {
    id:"res4", companyName:"Supreme Restoration Services", contactName:"Steve (Owner)",
    title:"Owner/Operator", email:"steve@supremerestoration.ca", phone:"(519) 354-7777",
    website:"supremerestoration.ca", industry:"Property Restoration", location:"Chatham-Kent, ON",
    employees:"1–10", revenue:"$500K–$1.5M CAD", founded:"2012", score:76,
    tags:["Independent","Residential","Local"], linkedin:"", twitter:"", instagram:"",
    summary:"Locally owned restoration operator in Chatham-Kent. Nimble, owner-operated — open to referral and preferred-vendor arrangements with adjusters and brokers."
  },
  {
    id:"res5", companyName:"First Onsite – Windsor", contactName:"Branch Manager",
    title:"Regional Director", email:"windsor@firstonsite.ca", phone:"(519) 256-4000",
    website:"firstonsite.ca", industry:"Property Restoration", location:"Windsor, ON",
    employees:"50–200", revenue:"$5M–$20M CAD", founded:"2001", score:88,
    tags:["National","Large-Loss","Commercial"], linkedin:"", twitter:"", instagram:"",
    summary:"Windsor branch of First Onsite. Handles large commercial losses and catastrophe response across Essex County. Top-tier co-referral target."
  },
  {
    id:"res6", companyName:"WINMAR – Chatham", contactName:"Dale Fortier",
    title:"Owner", email:"dale@winmarchatham.ca", phone:"(519) 351-9600",
    website:"winmar.ca", industry:"Property Restoration", location:"Chatham, ON",
    employees:"10–50", revenue:"$1M–$4M CAD", founded:"2003", score:83,
    tags:["Franchise","Insurer-Direct","Residential"], linkedin:"", twitter:"", instagram:"",
    summary:"WINMAR franchise serving Chatham-Kent. Strong insurer-direct relationships and a reputation for quality residential and commercial restoration."
  },
  {
    id:"res8", companyName:"BELFOR Property Restoration – SW Ontario", contactName:"Regional Director",
    title:"Regional Director", email:"ontario@belfor.com", phone:"(519) 966-3300",
    website:"belfor.com", industry:"Property Restoration", location:"Windsor, ON",
    employees:"200+", revenue:"$20M+ CAD", founded:"1946", score:93,
    tags:["Global","Catastrophe","Large-Loss"], linkedin:"", twitter:"", instagram:"",
    summary:"World's largest restoration contractor. BELFOR SW Ontario handles catastrophe, large-loss commercial, and complex residential claims. Premier partner for high-volume adjuster relationships."
  }
];
 
const CLIENTS = {
  adjuster: {
    label: "Insurance Adjusters",
    icon: "🏢",
    color: "#f59e0b",
    pitch: "Building referral relationships with independent and staff adjusters across SW Ontario",
    prospects: ADJUSTER_PROSPECTS
  },
  restoration: {
    label: "Restoration Contractors",
    icon: "🔧",
    color: "#22d3ee",
    pitch: "Connecting with restoration contractors for preferred-vendor and co-referral partnerships",
    prospects: RESTORATION_PROSPECTS
  }
};

export default CLIENTS;