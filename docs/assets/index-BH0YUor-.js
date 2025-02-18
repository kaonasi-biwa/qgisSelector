(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))t(s);new MutationObserver(s=>{for(const e of s)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&t(r)}).observe(document,{childList:!0,subtree:!0});function i(s){const e={};return s.integrity&&(e.integrity=s.integrity),s.referrerPolicy&&(e.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?e.credentials="include":s.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function t(s){if(s.ep)return;s.ep=!0;const e=i(s);fetch(s.href,e)}})();function a(l){l.addEventListener("click",()=>{document.querySelector("#output").value=d()})}function d(){let l=document.querySelector("#input").value;l=l.replace(/<.*?>/g,"");const n=[];for(const t of l.split(`
`))t.startsWith("-")?n.push({pref:t.slice(1).trim(),cities:""}):t.trim()!==""&&n.length!==0&&(n.at(-1).cities+=t+`
`);const i=[];for(const t of n)i.push(p(t));return`${i.join(" OR ")}`}function p(l){let n=l.cities,i="",t="";for(const s of n.split(`
`)){let e=s.trim();if(e!==""){if(e.includes("(")){const r=e.match(/\(.*\)/)[0].slice(1,-1);e=e.replace(`(${r})`,""),e.endsWith("町")||e.endsWith("村")?(e=e.replace(/^.*?郡|^.*?支庁/,""),t+=`("CITY_NAME" = '${e}' AND (${f(r)})) OR `,i=""):e.endsWith("市")?(t+=`("CITY_NAME" LIKE '${e}%' AND (${f(r)})) OR `,i=""):e.endsWith("区")&&(e.includes("市")?(i=e.match(/^.*?市/)[0],t+=`("CITY_NAME" LIKE '${e}%' AND (${f(r)})) OR `):i?t+=`("CITY_NAME" LIKE '${i}${e}%' AND (${f(r)})) OR `:t+=`("CITY_NAME" LIKE '${e}%' AND (${f(r)})) OR `)}else if(e.endsWith("町")||e.endsWith("村")){e=e.replace(/^.*?郡|^.*?支庁/,"");for(const r of e.split("・"))t+=`"CITY_NAME" = '${r}' OR `;i=""}else if(e.endsWith("市")){for(const r of e.split("・"))t+=`"CITY_NAME" LIKE '${r}%' OR `;i=""}else if(e.endsWith("区"))if(e.includes("市")){i=e.match(/^.*?市/)[0],e=e.replace(i,"");for(const r of e.split("・"))t+=`"CITY_NAME" LIKE '${i}${r}%' OR `}else{for(const r of e.split("・"))t+=`"CITY_NAME" LIKE '${r}%' OR `;i=""}}}return t?`("PREF_NAME" = '${l.pref}' AND (${t.slice(0,-4)}))`:"(1 = 1)"}let c="";function f(l,n=""){c=l;let i="",t="",s=!0,e=!1,r=!1;function u(){return r?`"JINKO" = ${t.slice(1,-2)}`:t==="NULL"?'"S_NAME" IS NULL':`"S_NAME" LIKE '${n}${t}${e?"":"%"}'`}for(;c.length!==0;){const o=c;if(c=c.slice(1),o.startsWith("]"))break;if(o.startsWith("を除く")){s=!1,c=c.slice(2);continue}if(o.startsWith("[")){i+=`(${u()} AND (${f(c,t)})) OR `,t="",e=!1;continue}if(o.startsWith("$")){e=!0;continue}if(o.startsWith("人")&&t.startsWith("人口")){r=!0;continue}if(o.startsWith("・")||o.startsWith("、")||o.startsWith(",")){t&&(i+=`(${u()}) OR `),t="";continue}t+=o.slice(0,1)}return t&&t&&(i+=`(${u()}) OR `),i?s?i.slice(0,-4):`NOT (${i.slice(0,-4)})`:"1 = 1"}a(document.querySelector("#counter"));
