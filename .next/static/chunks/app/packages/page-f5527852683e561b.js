(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[547],{1666:function(e,t,a){Promise.resolve().then(a.bind(a,8757))},8757:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return page}});var s=a(7437),l=a(2265),n=JSON.parse('[{"name":"fmdapi-node-weaver","type":"npm","day":0,"week":2,"year":93,"total":93},{"name":"react-canvas-editor","type":"npm","day":0,"week":18,"year":1482,"total":1482},{"name":"canvas-editor","type":"npm","day":1,"week":20,"year":1407,"total":1407},{"name":"neo-pusher","type":"pypi","last_day":14,"last_week":991,"last_month":1092,"total":1092}]'),r=a(1396),i=a.n(r),c={src:"/_next/static/media/npm-svgrepo-com.ef97023b.svg",height:800,width:800,blurWidth:0,blurHeight:0},o={src:"/_next/static/media/pypi-svg.e98d63dd.svg",height:226,width:256,blurWidth:0,blurHeight:0},d={src:"/_next/static/media/bx-filter-alt.8c32896c.svg",height:24,width:24,blurWidth:0,blurHeight:0},m={src:"/_next/static/media/bxs-download.d613a3c7.svg",height:24,width:24,blurWidth:0,blurHeight:0},h={src:"/_next/static/media/bxl-github.af358662.svg",height:24,width:24,blurWidth:0,blurHeight:0},x=a(6691),u=a.n(x),p=a(9805),f=a(3097),g=a(2067),w=a.n(g),page=()=>{let[e,t]=(0,l.useState)(w()().format("YYYY-MM-DD")),[a,r]=(0,l.useState)(w()().format("YYYY-MM-DD")),[x,g]=(0,l.useState)(!1),[j,y]=(0,l.useState)(0),[v,b]=(0,l.useState)(!1),[N,k]=(0,l.useState)(!1),[D,_]=(0,l.useState)({name:"fmdapi-node-weaver",type:"npm",day:0,week:3,year:70,total:70}),[C,S]=(0,l.useState)(n);function closeModal(){k(!1),b(!1)}async function fetchNpmStats(e,t){g(!0);let a="https://api.npmjs.org/downloads/range/".concat(t,"/@mindfiredigital/").concat(e),s=await fetch(a);if(!s.ok)throw console.log("Failed to fetch download stats for ".concat(e," (").concat(t,"): ").concat(s.statusText)),g(!1),Error("HTTP error! status: ".concat(s.status));let l=await s.json();return g(!1),l}function calculateDownloads(e){return e&&e.downloads?e.downloads.reduce((e,t)=>e+t.downloads,0):0}function handleChange(e){if(!D)return;let t=function(e){let t=new Date,a=t.getFullYear(),s=t.getMonth(),l=t.getDate();switch(e.toLowerCase()){case"today":return b(!1),{start:formatDate(new Date(a,s,l)),end:formatDate(new Date(a,s,l))};case"yesterday":{b(!1);let e=new Date(a,s,l-1);return{start:formatDate(e),end:formatDate(e)}}case"last month":{b(!1);let e=new Date(a,s-1,1),t=new Date(a,s,0);return{start:formatDate(e),end:formatDate(t)}}case"this month":{b(!1);let e=new Date(a,s,1);return{start:formatDate(e),end:formatDate(t)}}case"last quarter":{b(!1);let e=3*Math.floor(s/3),t=new Date(a,e-3,1),l=new Date(a,e,0);return{start:formatDate(t),end:formatDate(l)}}case"this year":{b(!1);let e=new Date(a,0,1);return{start:formatDate(e),end:formatDate(t)}}case"custom":return b(!0),y(0),{start:formatDate(new Date(a,s,l)),end:formatDate(new Date(a,s,l))};default:return b(!1),{start:"1000-01-01",end:"3000-01-01"}}}(e.target.value);"npm"===D.type?fetchNpmStats(D.name,"".concat(t.start,":").concat(t.end)).then(e=>{g(!0);let t=calculateDownloads(e);y(t),g(!1)}):"pypi"===D.type&&y(Number(e.target.value)||0)}function formatDate(e){return e.toISOString().split("T")[0]}(0,l.useEffect)(()=>{D&&y("npm"===D.type?D.total||0:D.last_month||0)},[D]);let generateChart=async()=>{if("npm"===D.type){let t=await fetchNpmStats(D.name,"".concat(e,":").concat(a));y(calculateDownloads(t))}};return(0,l.useEffect)(()=>{v&&"npm"===D.type&&generateChart()},[e,a,v,D]),(0,s.jsx)("section",{className:"bg-slate-50",children:(0,s.jsxs)("div",{className:"container mx-auto flex flex-col gap-4 items-center",children:[(0,s.jsx)("h1",{className:"text-4xl leading-10 md:text-5xl md:!leading-[3.5rem] tracking-wide text-mindfire-text-black mt-10",children:"Our Packages"}),(0,s.jsx)("p",{className:"mt-6 text-xl text-mf-light-grey tracking-wide mb-10 text-center",children:"Elevate your projects with Mindfire's game-changing open-source packages."}),(0,s.jsx)("div",{className:"flex flex-col gap-4 flex-wrap lg:flex-row justify-center",children:C.map(e=>(0,s.jsxs)("div",{className:"border p-4 rounded bg-white flex flex-col justify-stretch drop-shadow-md w-80 hover:scale-105",children:[(0,s.jsxs)("div",{className:"flex flex-row items-start justify-between",children:[(0,s.jsx)("div",{children:(0,s.jsx)("h3",{className:"font-semibold mb-2 ml-2 text-mindfire-text-black capitalize",children:e.name.replaceAll("-"," ")})}),(0,s.jsx)("div",{className:"flex flex-row",children:(0,s.jsx)("div",{children:(0,s.jsx)("button",{className:"font-bold px-2 py-1 rounded inline-flex items-center",onClick:()=>{_(e),k(!0),y("npm"===D.type?D.total||0:D.last_month||0)},title:"Filter",children:(0,s.jsx)(u(),{src:d,height:20,width:20,alt:"expand_img",loading:"lazy",quality:75})})})})]}),(0,s.jsxs)("div",{className:"flex flex-row items-center mt-4",children:[(0,s.jsx)("div",{className:"flex justify-around w-full",children:(0,s.jsxs)("div",{className:"flex flex-col mr-auto ml-2",children:[(0,s.jsxs)("div",{className:"flex flex-row items-center space-x-1",children:[(0,s.jsx)(u(),{src:m,height:20,width:20,alt:"expand_img",loading:"lazy",quality:75}),(0,s.jsx)("div",{children:(0,s.jsx)("h6",{className:"text-mindfire-text-black font-semibold text-xl",children:"pypi"===e.type?e.last_month:e.total})})]}),(0,s.jsx)("div",{className:"mt-2",children:(0,s.jsx)("p",{className:"text-gray-500 text-xm",children:"Downloads"})})]})}),(0,s.jsxs)("div",{className:"mt-8 mr-1 flex flex-row items-center space-x-1",children:[(0,s.jsx)("div",{children:(0,s.jsx)(i(),{href:"npm"===e.type?"https://www.npmjs.com/package/@mindfiredigital/".concat(e.name):"https://pypi.org/project/".concat(e.name,"/"),target:"_blank",title:"View Package",children:(0,s.jsx)(u(),{src:"pypi"===e.type?o:c,height:35,width:35,alt:"package_img",loading:"lazy",quality:75})})}),(0,s.jsx)("div",{children:(0,s.jsx)(i(),{href:"https://github.com/mindfiredigital/".concat(e.name),target:"_blank",title:"Github",children:(0,s.jsx)(u(),{src:h,height:30,width:30,alt:"github_img",loading:"lazy",quality:75})})})]})]})]},e.name))}),(0,s.jsx)(p.u,{appear:!0,show:N,as:l.Fragment,children:(0,s.jsxs)(f.V,{as:"div",className:"relative z-10",onClose:closeModal,children:[(0,s.jsx)(p.u.Child,{as:l.Fragment,enter:"ease-out duration-300",enterFrom:"opacity-0",enterTo:"opacity-100",leave:"ease-in duration-200",leaveFrom:"opacity-100",leaveTo:"opacity-0",children:(0,s.jsx)("div",{className:"fixed inset-0 bg-black/25"})}),(0,s.jsx)("div",{className:"fixed inset-0 overflow-y-auto",children:(0,s.jsx)("div",{className:"flex min-h-full items-center justify-center p-4 text-center",children:(0,s.jsx)(p.u.Child,{as:l.Fragment,enter:"ease-out duration-300",enterFrom:"opacity-0 scale-95",enterTo:"opacity-100 scale-100",leave:"ease-in duration-200",leaveFrom:"opacity-100 scale-100",leaveTo:"opacity-0 scale-95",children:(0,s.jsxs)(f.V.Panel,{className:"w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all",children:[(0,s.jsx)("div",{className:"absolute right-2 top-2",children:(0,s.jsx)("button",{onClick:closeModal,className:"text-gray-500 hover:text-gray-700 focus:outline-none",children:(0,s.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"black",children:(0,s.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})}),(0,s.jsx)(f.V.Title,{as:"h1",className:"text-lg font-large leading-6 text-gray-900 capitalize text-center mb-4 font-extrabold",children:D.name.replaceAll("-"," ")}),(0,s.jsxs)("div",{className:"border p-4 rounded bg-white flex flex-col justify-stretch",children:[(0,s.jsxs)("div",{className:"mb-4 flex justify-center items-center",children:[(0,s.jsx)("p",{className:"text-mindfire-text-black text-xm font-bold mr-2",children:"Select"}),(0,s.jsxs)("div",{className:"relative inline-block w-32",children:["npm"===D.type?(0,s.jsxs)("select",{id:"range",className:"bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-1 appearance-none outline-none",onChange:handleChange,children:[(0,s.jsx)("option",{value:"Today",children:"Today"}),(0,s.jsx)("option",{value:"Yesterday",children:"Yesterday"}),(0,s.jsx)("option",{value:"Last month",children:"Last month"}),(0,s.jsx)("option",{value:"this month",children:"This month"}),(0,s.jsx)("option",{value:"last quarter",children:"Last quarter"}),(0,s.jsx)("option",{value:"this year",children:"This year"}),(0,s.jsx)("option",{value:"custom",children:"Custom Range"})]}):(0,s.jsxs)("select",{id:"range",className:"bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-1 appearance-none outline-none",onChange:handleChange,children:[(0,s.jsx)("option",{value:D.last_month,children:"Last month"}),(0,s.jsx)("option",{value:D.last_day,children:"Yesterday"}),(0,s.jsx)("option",{value:D.last_week,children:"Last week"})]}),(0,s.jsx)("div",{className:"absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none",children:(0,s.jsx)("svg",{className:"w-4 h-4 fill-current text-gray-500",viewBox:"0 0 20 20",xmlns:"http://www.w3.org/2000/svg",children:(0,s.jsx)("path",{d:"M7 7l3-3 3 3m0 6l-3 3-3-3",stroke:"currentColor",strokeWidth:"1.5",fill:"none",strokeLinecap:"round",strokeLinejoin:"round"})})})]})]}),(0,s.jsxs)("div",{className:"flex flex-col items-center",children:[v&&"npm"===D.type?(0,s.jsx)("div",{className:"container bg-white",children:(0,s.jsxs)("div",{className:"flex ml-6 mb-4",children:[(0,s.jsxs)("div",{className:"mr-1",children:[(0,s.jsx)("label",{htmlFor:"startDate",className:"block font-semibold text-center",children:"Start Date:"}),(0,s.jsx)("input",{type:"date",id:"startDate",className:"border border-gray-300 rounded-md px-2 py-1",value:e,onChange:e=>t(e.target.value)})]}),(0,s.jsxs)("div",{className:"ml-1",children:[(0,s.jsx)("label",{htmlFor:"endDate",className:"block font-semibold text-center",children:"End Date:"}),(0,s.jsx)("input",{type:"date",id:"endDate",className:"border border-gray-300 rounded-md px-2 py-1",value:a,onChange:e=>r(e.target.value)})]})]})}):null,(0,s.jsx)("div",{className:"flex flex-col items-center mt-4",children:(0,s.jsx)("div",{className:"flex justify-around w-full",children:(0,s.jsxs)("div",{className:"flex flex-col items-center",children:[(0,s.jsxs)("div",{className:"flex flex-row items-center space-x-1",children:[(0,s.jsx)(u(),{src:m,height:20,width:20,alt:"expand_img",loading:"lazy",quality:75}),(0,s.jsx)("div",{children:x?(0,s.jsx)("div",{className:"flex justify-center items-center w-5 h-5 border border-t-4 border-gray-700 rounded-full animate-spin",children:(0,s.jsx)("svg",{className:"animate-spin h-5 w-5 mr-3 ...",viewBox:"0 0 24 24",children:" "})}):(0,s.jsx)("h6",{className:"text-mindfire-text-black font-semibold text-xl",children:j})})]}),(0,s.jsx)("div",{className:"mt-2 ml-2",children:(0,s.jsx)("p",{className:"text-mindfire-text-black text-xm",children:"Downloads"})})]})})})]})]})]})})})})]})})]})})}}},function(e){e.O(0,[990,724,964,815,971,864,744],function(){return e(e.s=1666)}),_N_E=e.O()}]);