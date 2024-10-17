(()=>{
    const width = 500;
    const height = 500;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 40;

    // 'Gender', 'Marital Status', 'Qualification','Employment','Loan Type', 'Type of city','Loan Entity', 'Debt', 'Defaulting Payment Status', 'Assets'
    const creditSegments = ["Low", "Good", "Excellent"];
    const col = "Assets"

    const groupDataByColumnAndSegment = (data) => {
        return d3.rollup(
            data,
            v => ({
                Low: v.filter(d => d.Segment === "Low").length,
                Good: v.filter(d => d.Segment === "Good").length,
                Excellent: v.filter(d => d.Segment === "Excellent").length
            }),
            d => d[col]
        );
    };

    const processData = (groupedData) => {
        return Array.from(groupedData, ([column, segments]) => ({
            column: column,
            Low: segments.Low,
            Good: segments.Good,
            Excellent: segments.Excellent
        }));
    };

    const SendToBackend = (processedData) => {
        // Format the processedData into a string or JSON format to send to backend
        let fileContent = `These are the counts for ${col} column for each Segment[Low,Good,Excellent] of Credit Score:\n`;

        processedData.forEach(d => {
            fileContent += `\nColumn: ${d.column}\n`
            fileContent += `Low: ${d.Low}\n`
            fileContent += `Good: ${d.Good}\n`
            fileContent += `Excellent: ${d.Excellent}\n\n`
        });

        // Send the data to the backend using the Fetch API
        fetch('http://localhost:5000/process-data', {  // Assuming Flask is running on localhost:5000
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileContent: fileContent })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    d3.csv("final_dataset.csv").then(data=>{
        const groupedData = groupDataByColumnAndSegment(data);
        const processedData = processData(groupedData);

        console.log(groupedData)
        console.log(typeof(processedData))

        const series = d3.stack()
        .keys(creditSegments)
        (processedData);

        // Prepare the scales for the X-axis (gender) and Y-axis (count)
        const x = d3.scaleBand()
        .domain(processedData.map(d => d.column))
        .range([marginLeft, width - marginRight])
        .padding(0.1);

        const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .rangeRound([height - marginBottom, marginTop]);

        // Set the color scale for the credit score segments
        const color = d3.scaleOrdinal()
        .domain(creditSegments)
        .range(d3.schemeSpectral[creditSegments.length])
        .unknown("#ccc");

        console.log(d3.max(series,d=>d3.max(d,d=>d[1])))

        // Create the SVG container
        const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

        svg.append("g")
        .attr("transform", `translate(0,${height-marginBottom})`)
        .call(d3.axisBottom(x));

        svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y));

        console.log(series)

        // Append groups for each series (credit score segment) and create rectangles for the bars
        svg.append("g")
        .selectAll()
        .data(series)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(D => D.map(d => (d.key = D.key, d)))
        .join("rect")
        .attr("x", d => x(d.data.column))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .append("title")
        .text(d => `${d.data.column}, ${d.key}: ${d[1] - d[0]}`);

        d3.select("body").append(()=>svg.node())

        // SendToBackend(processedData)
    })
})()