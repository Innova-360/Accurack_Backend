import * as cheerio from 'cheerio';

export function parseHtml(html: string) {
    const $ = cheerio.load(html);
    const data: any[] = [];

    $('table').each((_index, table) => {

        if (_index !== 4) return;

        $(table)
            .find('tr:gt(0)')
            .each((_i, row) => {
                const rowData: any = {};
                $(row)
                    .find('td')
                    .each((j, cell) => {
                        if (j === 0) {
                            const splittedData = $(cell).text().split("/");

                            if(splittedData[0].includes("\n") || splittedData[0].includes("Totals")) {
                                rowData["PLU"] = "";
                                rowData["SKU"] = "";
                                return    
                            }
                            // rowData["PLU"] = splittedData[0];
                            rowData["PLU"] = $(cell).text();
                            // rowData["SKU"] = splittedData[1];
                            rowData["SKU"] = $(cell).text();
                        }
                        else if (j === 2) {
                            rowData["description"] = $(cell).text();
                            rowData["name"] = $(cell).text();
                            rowData["category"] = "New Category"
                        }
                        else if (j === 4) {
                            rowData["price"] = parseFloat($(cell).text());
                        }
                        else if (j === 6) {
                            rowData["stock"] = parseInt($(cell).text());
                        }
                    });
                if (Object.keys(rowData).length > 0 &&
                    (rowData["PLU"] !== "") &&
                    rowData["SKU"] !== "") {
                    data.push(rowData);
                }
            });
    });

    return data;
}