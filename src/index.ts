import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import puppeteer from 'puppeteer';
import * as fs from 'fs';
const filedir = path.join(__dirname);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const indexPage = filedir + "/index.html";

const printLabel = async (html: string): Promise<any> => {
    return new Promise(async (resolve) => {
        try {
            const puppeteerInstance = await puppeteer.launch({
                // headless: true,
                executablePath:"~/.cache/puppeteer",
                args: [
                ]
            });
            const page = await puppeteerInstance.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

            // To reflect CSS used for screens instead of print
            await page.emulateMediaType('screen');

            const filepath = `${filedir}/Label.png`;

            const content: any = await page.$("body");
            const imageBuffer = await content.screenshot({ omitBackground: true });

            fs.writeFileSync(filepath, imageBuffer);
            await page.close();
            await puppeteerInstance.close();
            return resolve(filepath);
        } catch (err) { console.log("err", err) }
        return resolve(null);
    })
};

app.post('/printLabel', async function (req: Request, res: Response) {
    const objBody = req.body;
    let LabelHtml = fs.readFileSync(`${filedir}/format_label.html`, 'utf-8')
    LabelHtml = LabelHtml.replace('{servingsize}', objBody.servingsize)
        .replace('{calories}', objBody.calories)
        .replace('{totalfat}', objBody.totalfat)
        .replace('{totalfatper}', objBody.totalfatper)
        .replace('{saturatedfat}', objBody.saturatedfat)
        .replace('{saturatedfatper}', objBody.saturatedfatper)
        .replace('{transfat}', objBody.transfat)
        .replace('{transfatper}', objBody.transfatper)
        .replace('{cholesterol}', objBody.cholesterol)
        .replace('{cholesterolper}', objBody.cholesterolper)
        .replace('{sodium}', objBody.sodium)
        .replace('{sodiumper}', objBody.sodiumper)
        .replace('{totalcarbohydrate}', objBody.totalcarbohydrate)
        .replace('{totalcarbohydrateper}', objBody.totalcarbohydrateper)
        .replace('{dietaryfiber}', objBody.dietaryfiber)
        .replace('{dietaryfiberper}', objBody.dietaryfiberper)
        .replace('{totalsugars}', objBody.totalsugars)
        .replace('{includsugars}', objBody.includsugars)
        .replace('{includsugarsper}', objBody.includsugarsper)
        .replace('{protein}', objBody.protein)
        .replace('{vitamind}', objBody.vitamind)
        .replace('{vitamindper}', objBody.vitamindper)
        .replace('{calcium}', objBody.calcium)
        .replace('{calciumper}', objBody.calciumper)
        .replace('{iron}', objBody.iron)
        .replace('{ironper}', objBody.ironper)
        .replace('{potassium}', objBody.potassium)
        .replace('{potassiumper}', objBody.potassiumper);

    const filePath = await printLabel(LabelHtml)
    // res.send(filePath)

    console.log("filePath", filePath)
    if (filePath) {
        var stat = fs.statSync(filePath);

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': stat.size
        });

        var readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    } else {
        res.json({ success: false, message: "something went wrong" });
    }
})

app.get('/', function (req, res) {
    res.sendFile(indexPage)
});

app.listen(1101, function () {
    console.log('App listening on port ' + 1101)
})
