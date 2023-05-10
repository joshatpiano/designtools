
const chartMax = 4000;

const headlines = [  "Biden unveils new plan to tackle climate change",  "COVID-19 cases rise again in some US states",  "China launches new space station module",  "Supreme Court rules in favor of LGBTQ+ rights",  "Police officer charged in Daunte Wright shooting",  "US and Russia agree to extend New START treaty",  "Prince Philip's funeral held at Windsor Castle",  "Derek Chauvin found guilty on all charges",  "India reports record-breaking COVID-19 cases",  "Bitcoin hits all-time high",  "Gunman kills 8 at FedEx facility in Indianapolis",  "Israeli-Palestinian conflict escalates in Gaza",  "New study finds link between processed meat and cancer",  "US and EU impose sanctions on Russia over Navalny",  "NASA's Ingenuity helicopter makes first flight on Mars",  "Biden administration announces new immigration policy",  "Protests erupt after police shooting of Adam Toledo",  "Tokyo Olympics to proceed despite COVID-19 concerns",  "Johnson & Johnson vaccine paused due to blood clot concerns",  "Myanmar coup leaders impose internet blackout"]
const tags = ["politics",  "world",  "business",  "technology",  "entertainment",  "sports",  "health",  "science",  "education",  "lifestyle", "lipsum"];

function easeOutExpo(currentTime, startValue, endValue, duration) {
  	return endValue * (-Math.pow(2, -10 * currentTime / duration) + 1) + startValue;
}

function randomizeScalar(num) {
	let range = Math.ceil(Math.log10(num)) * 5;
	range = Math.min(range, num * 0.5);
	range = Math.max(range, 1);
	const randomNum = Math.floor(Math.random() * (range * 2 + 1)) - range;
	return num + randomNum;
}

function randomizeTrend() {
	let min = 0.12;
	let max = 6.00;

	let randomNum = Math.random() * (max - min) + min;
	randomNum = randomNum.toFixed(2);
	return randomNum;
}

function randomizePeak(n) {
	return Math.max(0,n - 100 - (Math.random() * 100));
}

const scalarTop = randomizeScalar(3200);
const scalarBottom = randomizeScalar(312);

function interpolateEase(n) {
	return Math.floor((1 - n) * scalarBottom + n * scalarTop);
}

const myFontLoadingFunction = async () => {
  await figma.loadFontAsync({ family: "Graphik", style: "Regular" });
}

myFontLoadingFunction().then(() => {

	console.clear();
	console.log('Running script...')

	//find the rows
	const selection = figma.currentPage.selection[0].type === "FRAME" ? figma.currentPage.selection[0] : figma.currentPage.selection[0].parent;
	const layers = selection.findAll(node => node.name === "Row");
	console.log(`Found ${layers.length} rows...`);

	const nodeContentType = selection.findOne(node => node.type === "TEXT" && node.name === "Content type value").characters;
	console.log(`Content type: ${nodeContentType}`);

	//setup easing
	var t = 0;
	const b = 0;
	const c = 1;
	var d = layers.length;

	//generate a fake highest value for the chart
	console.log(`Top scalar: ${scalarTop}, Bottom scalar: ${scalarBottom}`);

	var barMaxWidth;

	//iterate through...
	layers.forEach((layer,index) => {

		const nodeCurrentFill = layer.findOne(node => node.name === "Current fill");
		const nodePeakMarker = layer.findOne(node => node.name === "Peak marker");
		const nodeScalarPos = layer.findOne(node => node.name === "Scalar position");
		const nodeScalarText = layer.findOne(node => node.type === "TEXT" && node.name === "Scalar value");
		const nodeTrend = layer.findOne(node => node.name === "Trend control");
		const nodeTrendText = layer.findOne(node => node.type === "TEXT" && node.name === "Trend value");
		const nodeContentText = layer.findOne(node => node.type === "TEXT" && node.name === "Content title");

		//set content/tag value
		nodeContentText.characters = (nodeContentType === 'Content' ? headlines[t] : tags[t]);

		//get the maximum bar width
		if(index === 0) {
			const nodeBar = layer.findOne(node => node.name === "Bar");
			barMaxWidth = nodeBar.width;
			console.log(`Bar width: ${barMaxWidth}`);
		}

		//generate and apply the fake scalar value for the row
		const easeValue = easeOutExpo(t,b,c,d);
		const nCurrentScalar = scalarTop - interpolateEase(easeValue) + scalarBottom;
		nodeScalarText.characters = nCurrentScalar.toString();
		const nKeyWidth = nodeScalarText.width;

		//generate and apply the fake trend value for the row
		const nRandomTrend = randomizeTrend().toString();
		nodeTrendText.characters = `${nRandomTrend}%`;
		
		//calc the scalar's ratio to adjust the bar chart
		const nRatio = nCurrentScalar / chartMax;

		//calculate the right padding offset for the current fill
		const currentBarWidth = (nRatio * barMaxWidth);
		const nOffsetCurrentFill = barMaxWidth - currentBarWidth;
		nodeCurrentFill.paddingRight = nOffsetCurrentFill;
		nodeTrend.paddingLeft = currentBarWidth;

		//align scalar position, check if the scalar value will blow past the chart bounds, if so, zero it
		const nKeyOverflow = (nOffsetCurrentFill + nKeyWidth) - barMaxWidth;
		const nOffsetScalarPos = nOffsetCurrentFill - (nKeyOverflow > 0 ? nKeyOverflow : 0);
		nodeScalarPos.paddingRight = nOffsetScalarPos;

		//generate a fake peak value for some rows and set its position
		if ([0, 2, 6].includes(t)) {
			const randomPeak = randomizePeak(nOffsetCurrentFill);
			nodePeakMarker.paddingRight = nodeTrend.paddingRight = randomPeak;
			nodePeakMarker.opacity = 1;
		} else {
			nodePeakMarker.paddingRight = 0;
			nodePeakMarker.opacity = 0;
		}
		
		console.log(`Ease: ${easeValue} -> Scalar: ${nCurrentScalar} -> Ratio: ${nRatio} -> Bar offset from right: ${nOffsetCurrentFill}`);
		console.log(`.....Key width: ${nKeyWidth} -> Scalar overflow: ${nKeyOverflow}`);

		t++;

	});

	figma.closePlugin();
});