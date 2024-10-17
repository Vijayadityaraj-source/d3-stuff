const h=500
const w=500
const padding=30

const x=d3.scaleLinear()
    .domain([0,11000])
    .range([padding,w-padding])

const y=d3.scaleLinear()
    .domain([0,10])
    .range([h-padding,padding])

const svg=d3.create("svg")
    .attr("height",h)
    .attr("width",w)

//Add x and y axis
svg.append("g")
    .attr("transform", `translate(0,${h - padding})`)
    .call(d3.axisBottom(x));

svg.append("g")
    .attr("transform", `translate(${padding},0)`)
    .call(d3.axisLeft(y));

//adding svg to body
d3.select("body")
    .append(()=>svg.node())

d3.csv("final_dataset.csv").then(data=>{
    data.forEach(d => {
        d.credit_score = +d.credit_score;
    });

    console.log(data)

    svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d,i) => x(i))
    .attr("cy", d => y(d.credit_score))
    .attr("r", 2)
    .attr("fill",(d,i)=>{
        if(d.client_id==105868){
            return "red"
        }
        else if(d.credit_score>3 && d.credit_score<7){
            return "yellow"
        }
        else if(d.credit_score<3){
            return "blue"
        }
        else{
            return "green"
        }
    })
    .append("title")
        .text(function(d,i){
            return `${i},${d.credit_score}`
        })
})