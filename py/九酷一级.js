js:
let body = input.split('#')[1];
let url = input.split('#')[0];
fetch_params.body = body;
fetch_params.headers['x-requested-with'] = 'XMLHttpRequest';
// fetch_params.headers['cookie'] = 'PHPSESSID=e7ht5hvema4sg0o8l1o5k0bqt1; Hm_lvt_eebb854b7348edadfb6b433786f5d059=1666239708; Hm_lpvt_eebb854b7348edadfb6b433786f5d059=1666244071';
let url = input.split('?')[0];
let html = post(url,fetch_params);
print(html);
let data = JSON.parse(html);