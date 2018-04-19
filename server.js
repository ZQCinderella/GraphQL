/**
 * Created by fet on 10/4/18.
 * GraphQl演示获取用户信息和添加用户信息
 */
const express = require('express');
const app = express();
const router = express.Router()
const port = process.env.PORT || 4000

const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
console.log(mongoose);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log('connected'));

const StudentSchema = mongoose.Schema({
  name: String,
  age: Number,
  sex: String,
  description: String
});

//通常项目已启动就要创建所有的model， 类似于数据库的建表
// mongoose会把modelName转为复数存在数据库中
const Student = mongoose.model('students', StudentSchema);


const insertStudent = (model, cb) => {
  model.save((err, instance) => {
    if (err) return console.error(err);
    Student.findOne({name: 'fet'}, (err, data) => console.log(data));
  });
}

//定义schema模型
//查询数据需要在Query下建模型
//增加或者更新数据需要在Mutation下建模型
//多个不同的变更接受相同的输入参数时候，用input关键字来定义输入类型
const schema = buildSchema(` 
    type User{  
      name: String  
      sex: String  
      age: Int 
      description: String
    } 

    input UserInput {
      name: String
      sex: String
      age: Int
      description: String
    }

    type Query {  
      user(id:Int!):User
      users: [User]
    }

    type Mutation{
        addUser(userInfo:UserInput):User
    }
`);  

//定义服务端数据
const root= {
  //获取单条用户数据
  user: ({id}) =>  {
      return myDB[id];
  },

  //  以上查询数据时的url传参格式, 所有String的参数只能用 ""  不能使用 ''
  // {
  //    user(id: "0") {
  //       name
  //       sex
  //       age
  //       description
  //     }
  //   }


  //获取全部用户数据
  users: () => {
      return myDB;
  },

  //  以上查询数据时的url传参格式
  // {
  //    users {
  //       name
  //       sex
  //       age
  //       description
  //     }
  //   }

  //添加用户信息
  addUser: ({userInfo}) => {
      const user={
          name:userInfo.name,
          sex:userInfo.sex,
          age:userInfo.age,
          description:userInfo.description
      };
      insertStudent(new Student(user));
      return user;
  }

  //  以上添加或者更新数据时的url传参格式
  //  mutation{
  //     	addUser(userInfo: {
  //         name: "gui.zhang.son",
  //         sex: "male",
  //         age: "10",
  //         description: "son is son,father is father"
  //       }) { //更新成功后返回的数据
  //    	  name
  //     	  sex
  //     	  age
  //    	  description
  //     	}
  //    }
};

//API: http://localhost:4000/graphql/userInfo
router.use('/userInfo', graphqlHTTP({
  schema: schema,     //传入scheme
  rootValue: root,    //传入数据
  graphiql: true,     //打开GUI界面
}));

app.use('/graphql', router)

app.listen(port); 




