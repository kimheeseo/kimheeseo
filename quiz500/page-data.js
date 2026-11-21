/* Same-origin, static JSON data loader. No eval, server or package runtime. */
(function(root){'use strict';const cache=new Map();root.QuizPageData={load:async(file)=>{const url=new URL(file,location.href).href;if(!cache.has(url))cache.set(url,QuizJSON.load(url).then(x=>x.data));return cache.get(url)}}})(window);
