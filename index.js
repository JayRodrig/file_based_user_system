// ----- GLOBAL VARIABLES
const fs = require('fs');
const express = require('express')();
const port = 3000;

// ----- EXPRESS CALLBACKS
express.get('/class/add/', (request, response) => {
    const reqKeys = Object.keys(request.query);
    const fileName = `${request.query.class}.json`;
    let studentObj = {};
    
    for (let key of reqKeys) {
        if (key === 'class') {
            studentObj = {};
        } else {
            studentObj[`${key}`] = request.query[key];
        }
    }
    
    const parsedObj = JSON.stringify(studentObj);
    
    fs.access(`./classes/${request.query.class}.json`, err => {
        if (err) {
            fs.writeFile(`./classes/${fileName}`, parsedObj, (err, res) => {
                if (err) throw new Error (`Error, couldn't write on file.`);
            });
        }  else {
            fs.readFile(`./classes/${fileName}`,'utf8', (err, data) => {
                if (data.includes(request.query.name)) {    
                    const studentArr = data.split(';');
                    for (let i = 0; i < studentArr.length; i++){      
                        if (studentArr[i].includes(request.query.name)){
                            studentArr.splice(i, 1);
                            studentArr.push(parsedObj);
                        
                            const fileData = studentArr.join(';');
                            fs.writeFile(`./classes/${fileName}`, fileData, (err, res) => {
                                if (err) throw new Error (`Error, couldn't write on file.`)
                            });
                        } 
                    }
                } 
                else {
                    fs.appendFile(`./classes/${fileName}`, `;${parsedObj}`, err => {
                        if (err) throw new Error (`Error, couldn't write on file`);
                    });
                }                
           });
        }
    });

    
    if (reqKeys.length < 5 || reqKeys.length > 5) {
        response.json({
            error: `Invalid Entry. Please fill out all student info. Class MUST be the first parameter. Name, Age, City and Grade should follow.`,
        });
    } else {   
        response.json({
            added: studentObj,
            class: request.query.class,
        });
    }
});

express.get('/class/list/', (request, response) => {
    const reqKeys = Object.keys(request.query);
    
    if (reqKeys.length > 1 || reqKeys[0].toLowerCase() !== 'class') {
        throw new Error (`Invalid input. Only the CLASS parameter is supported.`);
    }

    fs.access(`./classes/${request.query.class}.json`, err => {
        if (err) {
            response.json({ 
                    error: `${request.query.class} class doesn't exist.`,
            });
        } else {
            fs.readFile(`./classes/${request.query.class}.json`, 'utf8', (err, data) => {
                const strArr = data.split(';');
                const studentObjs = [];
                for (let str of strArr){
                    studentObjs.push(JSON.parse(str));
                }

                response.json({
                    students: studentObjs,
                });
            });
        }
    });

});

express.get('/class/listfailing/', (request, response) => {
    const reqKeys = Object.keys(request.query);
    
    if (reqKeys.length > 1 || reqKeys[0].toLowerCase() !== 'class') {
        throw new Error (`Invalid input. Only the CLASS parameter is supported.`);
    }

    fs.access(`./classes/${request.query.class}.json`, err => {
        if (err) {
            response.json({ 
                    error: `${request.query.class} class doesn't exist.`,
            });
        } else {
            fs.readFile(`./classes/${request.query.class}.json`, 'utf8', (err, data) => {
                const strArr = data.split(';');
                const studentObjs = [];
                const failingStudents = [];
                for (let str of strArr) {
                    studentObjs.push(JSON.parse(str));
                }
                
                for (let student of studentObjs) {
                    if (student.grade < 50) {
                        failingStudents.push(student);
                    }
                }

                response.json({
                    students: failingStudents,
                });
            });
        }
    });
});

express.get('/class/listfromcity/', (request, response) => {
    const reqKeys = Object.keys(request.query);

    if (reqKeys.length !== 2 || reqKeys[0].toLowerCase() !== 'class' && reqKeys[1].toLowerCase() !== 'city'){
        throw new Error (`Invalid input. Only CLASS & CITY parameters are supported.`);
    }

    fs.access(`./classes/${request.query.class}.json`, err => {
        if (err) {
            response.json({
                error: `${request.query.class} class doesn't exist.`
            })
        } else {
            fs.readFile(`./classes/${request.query.class}.json`, 'utf8', (err, data) => {
                const strArr = data.split(';');
                const studentObjs = [];
                const cityStudents = [];
                for (let str of strArr) {
                    studentObjs.push(JSON.parse(str));
                }

                for (let student of studentObjs) {
                    if (student.city.toLowerCase() === request.query.city.toLowerCase()) {
                        cityStudents.push(student);
                    }
                }

                if (cityStudents.length < 1) {
                    response.json({
                        students: [],
                    });
                } else {
                    response.json({
                        students: cityStudents,
                    });
                }
            });
        }
    })
});

express.listen(port, () => {
    console.log('app is listening');
});