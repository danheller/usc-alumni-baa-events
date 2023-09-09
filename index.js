const http = require('http');
const puppeteer = require('puppeteer');
//const fs = require('fs');
const port = process.env.PORT || 80;
(async () => {
	const browser = await puppeteer.launch({
//		defaultViewport: {width: 1920, height: 1080},
		args: ['--no-sandbox','--disable-setuid-sandbox'],
		headless: true
	});
	const page = await browser.newPage();
	try {
		await page.goto('https://fightonline.usc.edu/s/events');

//		const firstResponse = await page.waitForResponse((response) => {
//			return response.url().endsWith('PORTAL_Listing.SERVER_getListings=1') && response.status() === 200;
//		});

//		const responsejson = await firstResponse.json();
//		console.log( "Started." );
//		var eventsjson = responsejson.actions[0].returnValue;
//		fs.writeFileSync('data/events.json', JSON.stringify(eventsjson));
//		console.log( eventsjson.length + " events found.");

		// event data, e.g. https://fightonline.usc.edu/s/sfsites/aura?r=6&other.PORTAL_Listing.SERVER_getListings=1
		http.createServer(function (req, res) {

			var affinityresults = '';
			var eventsjson = [];
			const aff = "Affinity: Black"; 
			page.waitForSelector('select[name="selectedtopicInterests"]').then(() => {
				console.log('Found select');
				page.select('select[name="selectedtopicInterests"]', aff);
				page.waitForSelector('button.slds-button.slds-button_brand.w-full').then(() => {
					console.log('Found button');

					page.click('button.slds-button.slds-button_brand.w-full');
					page.on('console', message => {
						const msgtxt = `${message.text()}`;
						if( 0 == msgtxt.indexOf('result: q') ) {
							affinityresults = msgtxt.substring( msgtxt.indexOf('[') );
							eventsjson = JSON.parse( affinityresults );
							console.log( eventsjson.length + " events found.");
					//					console.log( affinityresultsjson );
							if( eventsjson ) {
								res.writeHead(200, {'Content-Type': 'text/json'});
								res.end( JSON.stringify( eventsjson ) );
							} else {
								res.writeHead(200, {'Content-Type': 'text/html'});
								res.end( 'false' );
							}
							browser.close();
						}
					});
				}).catch(e => {
				  console.log('Could not find button');
				});
			}).catch(e => {
			  console.log('Could not find select');
			});
		}).listen( port );
	}  catch(err) {
		console.log(err);
	}
})();