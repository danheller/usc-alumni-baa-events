const http = require('http');
const puppeteer = require('puppeteer');
//const fs = require('fs');
const port = process.env.PORT || 80;
(async () => {
	const browser = await puppeteer.launch({
//		defaultViewport: {width: 1920, height: 1080},
		headless: true,
		args: ['--no-sandbox','--disable-setuid-sandbox']
	});
	const page = await browser.newPage();
	try {
		await page.goto('https://fightonline.usc.edu/s/events');

		// event data, e.g. https://fightonline.usc.edu/s/sfsites/aura?r=6&other.PORTAL_Listing.SERVER_getListings=1
		var affinityresults = '';
		var affinityresultsjson = [];


		const aff = "Affinity: Black"; //,"Affinity: Black","Affinity: Latino/x","Affinity: LGBTQ"];
		await page.waitForSelector('select[name="selectedtopicInterests"]');
		page.select('select', aff);

		await page.waitForSelector('button.slds-button.slds-button_brand.w-full');
		page.click('button.slds-button.slds-button_brand.w-full');



		var mergedeventsjson = [];
		page
			.on('console', message => {
				const msgtxt = `${message.text()}`;
				if( 0 == msgtxt.indexOf('result: q') ) {
					affinityresults = msgtxt.substring( msgtxt.indexOf('[') );
					affinityresultsjson = JSON.parse( affinityresults );
					console.log( affinityresultsjson.length + " events found.");
//					console.log( affinityresultsjson );

					http.createServer(function (req, res) {
						if( affinityresultsjson ) {
							res.writeHead(200, {'Content-Type': 'text/json'});
							res.end( JSON.stringify( affinityresultsjson ) );
						} else {
							res.writeHead(200, {'Content-Type': 'text/html'});
							res.end( 'false' );
						}
					}).listen( port );
					setTimeout( function() {
						browser.close();
					}, 1000 );
				}
			});
	}  catch(err) {
		console.log(err);
	}
//	await browser.close();

})();