const express=require('express');
const date=require(__dirname+'/date.js');
const _=require('lodash');
const mongoose=require('mongoose');
const url="mongodb+srv://kartiksri1911:Srivas%401911@cluster0.jjtjabb.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(url,{useNewUrlParser:true});
const app=express();
/* const items=["Buy food", "Eat food","Cook food"];
const workitems=[]; */
//Note: It is possible to push items in a const array but not possible to assign a completely different set of values to it.
app.set('view engine','ejs');

app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
const itemSchema=mongoose.Schema(
    {
        name:String
    }
)
const listSchema=mongoose.Schema({name:String, items:[itemSchema]});
const List=mongoose.model("List",listSchema);
const Items=mongoose.model("Item",itemSchema);
const item1=new Items({
    name: "Welcome to to-do-list!"
});
const item2=new Items({name:"Enter text & press + to add task"});
const item3=new Items({name:"<-Check the box to delete task"});
const defaultitems=[item1,item2,item3];

app.get('/favicon.ico', (req, res) => res.status(204).end()); 
app.get('/',(req,res)=>{
    let alllists=[];//for the drop down menu list items
    List.find({}).then(function(result){alllists=result});

    setTimeout(() => {

        Items.find({}).then(function(result){
            if(result.length===0)
            {
                Items.insertMany(defaultitems).then(function(){console.log("default insert success");}).catch(function(){console.log("Error insert default!!!");});
                result=defaultitems;
            }
            res.render("list",{
                    listTitle:"today",
                    todoitem:result,
                    alllists:alllists
            });
            });

    }, 200);
    });
app.get('/:topic',(req,res)=>{
    const topic=_.capitalize(req.params.topic);
    let alllists=[]; //for the drop down menu list items
    List.find({}).then(function(result){alllists=result});

    setTimeout(() => {
                List.findOne({name:topic})
            .then(function(result){
                res.render("list",{
                    listTitle:topic,
                    todoitem:result.items,
                    alllists:alllists
            });
        }).catch(function()
        {

            const newlist=new List({name:topic,items:defaultitems});
            newlist.save().then(res.render("list",{
                listTitle:topic,
                todoitem:newlist.items,
                alllists:alllists
                }));
            
        })  
    }, 200);
})

app.post('/',(req,res)=>{
    const item=req.body.todo;
    const listname=req.body.list;
    if(req.body.list==="today") //check comment near buttton tag as to why we have checked for only 'Work' instead of 'Work list'
    {
        Items.insertMany([{name:item}]);
    res.redirect('/');
    }
    else{
        const itemnew=new Items({name:item});
        List.findOne({name:listname}).then(function(result){
            result.items.push(itemnew);
            result.save().then(res.redirect("/"+result.name));
            
        });
    }
});
//for deleting an item
app.post('/delete',(req,res)=>{
    const tobedeleted=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="today")
    {
        Items.deleteOne({_id:tobedeleted}).then(function(){console.log("Deleted "+tobedeleted)}).catch(function(){console.log("error")});
    res.redirect('/');
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:tobedeleted}}})
        .then(function(result)
        {
            res.redirect('/'+listName);
        });
        
    }
    
})
app.post('/newlist',(req,res)=>{
    const name=req.body.newlist;
    res.redirect("/"+name);
})
app.listen(3000,()=>{
    console.log("Server Running at port 3000");
});
