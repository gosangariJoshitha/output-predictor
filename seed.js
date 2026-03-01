const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 🔥 DEFINE DB PROPERLY
const db = admin.firestore();

const questions = [
  { id: 1, language: "python", code: "print(2+3)", options: ["4","5","6","Error"], correctAnswer: "5" },
  { id: 2, language: "python", code: "x=5\nprint(x*2)", options: ["5","10","25","Error"], correctAnswer: "10" },
  { id: 3, language: "python", code: "print('Hello'*2)", options: ["HelloHello","Hello 2","Error","2Hello"], correctAnswer: "HelloHello" },
  { id: 4, language: "python", code: "print(type(True))", options: ["int","bool","str","float"], correctAnswer: "bool" },
  { id: 5, language: "python", code: "print(len('Python'))", options: ["5","6","7","Error"], correctAnswer: "6" },
  { id: 6, language: "python", code: "a=[1,2,3]\nprint(a[1])", options: ["1","2","3","Error"], correctAnswer: "2" },
  { id: 7, language: "python", code: "print(10//3)", options: ["3.3","3","4","Error"], correctAnswer: "3" },
  { id: 8, language: "python", code: "print(2**3)", options: ["6","8","9","Error"], correctAnswer: "8" },
  { id: 9, language: "python", code: "print(bool(''))", options: ["True","False","Error","None"], correctAnswer: "False" },
  { id: 10, language: "python", code: "print(5>3 and 2<1)", options: ["True","False","Error","None"], correctAnswer: "False" },

  { id: 11, language: "c", code: "#include<stdio.h>\nint main(){int a=5; printf(\"%d\",a);}", options: ["5","0","Error","Garbage"], correctAnswer: "5" },
  { id: 12, language: "c", code: "#include<stdio.h>\nint main(){int a=5; printf(\"%d\",a++);}", options: ["5","6","Error","0"], correctAnswer: "5" },
  { id: 13, language: "c", code: "#include<stdio.h>\nint main(){printf(\"%d\",2+3);}", options: ["5","23","Error","0"], correctAnswer: "5" },
  { id: 14, language: "c", code: "#include<stdio.h>\nint main(){int x=10; printf(\"%d\",x/3);}", options: ["3","3.3","4","Error"], correctAnswer: "3" },
  { id: 15, language: "c", code: "#include<stdio.h>\nint main(){printf(\"%d\",sizeof(int));}", options: ["2","4","8","Depends"], correctAnswer: "4" },
  { id: 16, language: "c", code: "#include<stdio.h>\nint main(){int a=2,b=3; printf(\"%d\",a*b);}", options: ["5","6","23","Error"], correctAnswer: "6" },
  { id: 17, language: "c", code: "#include<stdio.h>\nint main(){int a=5; if(a>3) printf(\"Yes\"); else printf(\"No\");}", options: ["Yes","No","Error","5"], correctAnswer: "Yes" },
  { id: 18, language: "c", code: "#include<stdio.h>\nint main(){printf(\"%c\",'A'+1);}", options: ["A","B","C","Error"], correctAnswer: "B" },
  { id: 19, language: "c", code: "#include<stdio.h>\nint main(){int a=3; printf(\"%d\",a<<1);}", options: ["3","6","9","Error"], correctAnswer: "6" },
  { id: 20, language: "c", code: "#include<stdio.h>\nint main(){int a=10; printf(\"%d\",a%3);}", options: ["1","2","3","0"], correctAnswer: "1" },

  { id: 21, language: "python", code: "print(3*'Hi')", options: ["HiHiHi","3Hi","Error","Hi3"], correctAnswer: "HiHiHi" },
  { id: 22, language: "python", code: "print(5==5.0)", options: ["True","False","Error","None"], correctAnswer: "True" },
  { id: 23, language: "python", code: "print(list(range(3)))", options: ["[0,1,2]","[1,2,3]","[0,1,2,3]","Error"], correctAnswer: "[0,1,2]" },
  { id: 24, language: "python", code: "print('abc'.upper())", options: ["ABC","abc","Error","Abc"], correctAnswer: "ABC" },
  { id: 25, language: "python", code: "print(10%4)", options: ["2","3","4","Error"], correctAnswer: "2" },
  { id: 26, language: "c", code: "#include<stdio.h>\nint main(){int a=5; printf(\"%d\",++a);}", options: ["5","6","Error","0"], correctAnswer: "6" },
  { id: 27, language: "c", code: "#include<stdio.h>\nint main(){int a=2; printf(\"%d\",a*a);}", options: ["2","4","22","Error"], correctAnswer: "4" },
  { id: 28, language: "c", code: "#include<stdio.h>\nint main(){printf(\"Hello\");}", options: ["Hello","hello","Error","Nothing"], correctAnswer: "Hello" },
  { id: 29, language: "python", code: "print(type(10))", options: ["int","float","str","bool"], correctAnswer: "int" },
  { id: 30, language: "python", code: "print(4+3*2)", options: ["14","10","11","Error"], correctAnswer: "10" }
];

async function seedData() {
  try {
    const batch = db.batch();

    questions.forEach(q => {
      const ref = db.collection("questions").doc(q.id.toString());
      batch.set(ref, q);
    });

    await batch.commit();

    console.log("🔥 30 Questions Inserted Successfully!");
    process.exit();
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

seedData();