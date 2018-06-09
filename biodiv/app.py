# import dependencies
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, desc
from flask import Flask, jsonify, render_template, request
import csv

# write app
app = Flask(__name__)

# create sqlite db
engine = create_engine("sqlite:///DataSets/belly_button_biodiversity1.sqlite")
Base = automap_base()
Base.prepare(engine, reflect=True)
session = Session(engine)

# tables
otu = Base.classes.otu
samples = Base.classes.samples
samples_metadata = Base.classes.samples_metadata

# dashboard homepage
@app.route("/")
def home():
    return render_template("index.html")

# list of samples
@app.route("/names")
def names():

    sample_ids = []
    
    results = session.query(samples_metadata.SAMPLEID)

    for result in results:
        sample_ids.append("BB_" + str(result[0]))

    return jsonify(sample_ids)

# list of OTU descriptions
@app.route("/otu")
def otu1():
    otu_descr = [] 
    results = session.query(otu.lowest_taxonomic_unit_found)
  
    for result in results:
        otu_descr.append(result[0])
    return jsonify(otu_descr)

# json dictionary of sample metadata
@app.route("/metadata/<sample>")
def metadata(sample): 
    
    sample_id = int(sample.split("_")[1])
   
    sample_metadata = {}
   
    samples = session.query (
        samples_metadata.SAMPLEID,
        samples_metadata.AGE,
        samples_metadata.GENDER,
        samples_metadata.BBTYPE,
        samples_metadata.ETHNICITY,
        samples_metadata.LOCATION
    )

    for info in samples:
        if (sample_id == info.SAMPLEID):
            sample_metadata["SAMPLEID"] = info.SAMPLEID
            sample_metadata["AGE"] = info.AGE
            sample_metadata["GENDER"] = info.GENDER
            sample_metadata["BBTYPE"] = info.BBTYPE
            sample_metadata["ETHNICITY"] = info.ETHNICITY
            sample_metadata["LOCATION"] = info.LOCATION

    return jsonify(sample_metadata)

# int value for weekly washing freq
@app.route("/wfreq/<sample>")
def wfreq(sample):

    sample_id = int(sample.split("_")[1])
  
    results = session.query(samples_metadata)
    
    for result in results:
        if (sample_id == result.SAMPLEID):
            wfreq = result.WFREQ
    return jsonify(wfreq)

# list of dictionaries for lists for 'otu_ids' and 'sample_values'
@app.route("/samples/<sample>")
def ids(sample):
       
    sample_query = "Samples." + sample

    samples_info = {}
    otu_ids = []
    sample_values = []

    results = session.query(samples.otu_id, sample_query).order_by(desc(sample_query))

    for result in results:
        otu_ids.append(result[0])
        sample_values.append(result[1])

    samples_info = {
        "otu_ids": otu_ids,
        "sample_values": sample_values
    }
    return jsonify(samples_info)

if __name__ == "__main__":
    app.run(debug=True)
