(()=>{
    const width = 500;
    const height = 500;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 40;

    /*'Age', 'Annual_Income', 'Payment_History_Monthly',
       'Monthly EMI', 'Loan Amount', 'Intrest Rate (Anual)','No. of Loans',
       'Loan Term','Debt (Approx Anual Debt Amount)','Debt to Income Ratio',
 */
    const creditSegments = ["Low", "Good", "Excellent"];
    const col = "Debt to Income Ratio"

    const SegmentedData = (data)=>{
        return{
            Low: data.filter(d=> d.Segment === "Low").map(d=> +d[col]),
            Good: data.filter(d=> d.Segment === "Good").map(d=> +d[col]),
            Excellent: data.filter(d=> d.Segment === "Excellent").map(d=> +d[col])
        }
    }

    const Desciptions = (data)=>{
        const desc = []
        
        Object.entries(data).forEach(d=>{
            const key = d[0]
            const values = d[1]
             
            const min = d3.min(values)
            const max = d3.max(values)
            const q1 = d3.quantile(values,0.25)
            const q2 = d3.quantile(values,0.50)
            const q3 = d3.quantile(values,0.75)
            const median = d3.median(values)
            const iqr = q3-q1
            const r0 = Math.max(min, q1 - iqr * 1.5);
            const r1 = Math.min(max, q3 + iqr * 1.5);
            const range = [r0,r1]
            desc.push ({
                key : key,
                min : +min,
                max : +max,
                median: median,
                q1: q1,
                q2: q2,
                q3: q3,
                range : range
            })
        })

        return desc;
    }

    const WriteToFile = (desc) => {
        let fileContent = `These are the metrics for ${col} column for each Segment[Low,Good,Excellent] of Credit Score: \n`;

        desc.forEach(d => {
            fileContent += `\nSegment: ${d.key}\n`
            fileContent += `Min: ${d.min}\n`
            fileContent += `Max: ${d.max}\n`
            fileContent += `Median: ${d.median}\n`
            fileContent += `Q1: ${d.q1}\n`
            fileContent += `Q2: ${d.q2}\n`
            fileContent += `Q3: ${d.q3}\n`
        })

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
        const mn = d3.min(data.map(d=>+d[col]))
        const mx = d3.max(data.map(d=>+d[col]))

        const NewData = SegmentedData(data)
        console.log(NewData)

        const desc = Desciptions(NewData)
        console.log(desc)

        const x = d3.scaleBand()
        .domain(creditSegments)
        .range([marginLeft,width-marginRight])
        .padding(0.1);

        const y = d3.scaleLinear()
        .domain([0,mx])
        .range([height-marginBottom,marginTop])

        const svg = d3.create("svg")
        .attr("width",width)
        .attr("height",height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

        svg.append("g")
        .attr("transform", `translate(0,${height-marginBottom})`)
        .call(d3.axisBottom(x))

        svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))

        svg
        .selectAll("vertLines")
        .data(desc)
        .enter()
        .append("line")
        .attr("x1", d => x(d.key) + x.bandwidth() / 2) // Align to the center of the band
        .attr("x2", d => x(d.key) + x.bandwidth() / 2) // Align to the center of the band
        .attr("y1", d => y(d.min))
        .attr("y2", d => y(d.max))
        .attr("stroke", "black")
        .style("width", 40);

        var boxWidth = 100
        svg
        .selectAll("boxes")
        .data(desc)
        .enter()
        .append("rect")
        .attr("x", d=>(x(d.key)-boxWidth/2) + x.bandwidth()/2)
        .attr("y", d=>(y(d.q3)))
        .attr("height", d=>y(d.q1)-y(d.q3))
        .attr("width", boxWidth )
        .attr("stroke", "black")
        .style("fill", "#69b3a2")

        svg
        .selectAll("medianLines")
        .data(desc)
        .enter()
        .append("line")
        .attr("x1", function(d){return(x(d.key)-boxWidth/2)+x.bandwidth()/2 })
        .attr("x2", function(d){return(x(d.key)+boxWidth/2)+x.bandwidth()/2 })
        .attr("y1", function(d){return(y(d.median))})
        .attr("y2", function(d){return(y(d.median))})
        .attr("stroke", "black")
        .style("width", 80)
        .append("title")
        .text(d=>`median : ${d.median}`)

        svg
        .selectAll("maxLines")
        .data(desc)
        .enter()
        .append("line")
        .attr("x1", d=>(x(d.key)-boxWidth/2)+x.bandwidth()/2)
        .attr("x2", d=>(x(d.key)+boxWidth/2)+x.bandwidth()/2)
        .attr("y1", d=>y(d.max))
        .attr("y2", d=>y(d.max))
        .attr("stroke", "black")
        .style("width", 80)
        .append("title")
        .text(d=>`max : ${d.max}`)

        svg
        .selectAll("minLines")
        .data(desc)
        .enter()
        .append("line")
        .attr("x1", d=>(x(d.key)-boxWidth/2)+x.bandwidth()/2)
        .attr("x2", d=>(x(d.key)+boxWidth/2)+x.bandwidth()/2)
        .attr("y1", d=>y(d.min))
        .attr("y2", d=>y(d.min))
        .attr("stroke", "black")
        .style("width", 80)
        .append("title")
        .text(d=>`min : ${d.min}`)

        d3.select("body").append(()=>svg.node())

        // WriteToFile(desc)
    })
})()