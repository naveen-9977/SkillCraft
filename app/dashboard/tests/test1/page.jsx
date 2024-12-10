"use client";

import Link from "next/link";
import React, { useRef, useState } from "react";

export default function TestPage() {
  let data = [
    {
      question: " What is the most used javascript framework",
      option1: "Angular",
      option2: "Express",
      option3: "svelte",
      option4: "React",
      ans: 1,
    },
    {
      question: "What is linux?",
      option1: "Kernel",
      option2: "Operating System",
      option3: "Framework",
      option4: "Networking Tool",
      ans: 1,
    },
    {
      question: "What is Mesh?",
      option1: "Programming Term",
      option2: "Networking Term",
      option3: "Framework",
      option4: "Networking Tool",
      ans: 2,
    },
  ];

  const length = data.length;
  console.log(length);
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(data[index]);
  const [isDisables, setIsDisabled] = useState(false);
  const [score, setScore] = useState(0);

  const handleIncrement = () => {
    setIsDisabled(false);
    optionArray.map((item) => {
      item.current.classList.remove("bg-green-600")
      item.current.classList.remove("bg-green-300")
      item.current.classList.remove("bg-rose-600")
    });
    if (index < length -1) {
      setIndex(index + 1);
      setQuestion(data[index + 1]);
    }
  };

  let option1 = useRef(null);
  let option2 = useRef(null);
  let option3 = useRef(null);
  let option4 = useRef(null);

  let optionArray = [option1, option2, option3, option4];

  const checkAns = (e, ans) => {
    setIsDisabled(true);
    if (question.ans == ans) {
      e.target.classList.add("bg-green-600");
      setScore(score + 1);
    } else {
      e.target.classList.add("bg-rose-600");
      optionArray[question.ans - 1].current.classList.add("bg-green-300");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="py-4 flex items-center justify-between border-b-[1px] border-zinc-200 px-4 lg:px-10 bg-white">
        <ul className="flex items-center gap-5">
          <li className="text-zinc-600">Question {index+1}</li>
        </ul>
      </div>
      <div className=" px-4">
        <div className="bg-white px-4 border-[1px] border-zinc-200 rounded my-6 py-4">
          <h4 className="md:text-lg font-medium">
            {index + 1}. {question.question}
          </h4>
          <h5 className="font-bold text-sm mt-4 mb-2 md:text-base">
            Conclusion:-
          </h5>
          <ol className="list-[lower-alpha] list-inside flex flex-col gap-1">
            <li className="">{question.option1}</li>
            <li className="">{question.option2}</li>
            <li className="">{question.option3}</li>
            <li className="">{question.option4}</li>
          </ol>
          <div className="flex flex-col gap-2 mt-12">
            <p
              className="flex flex-col py-2 px-4 rounded font-semibold text-zinc-800"
              ref={option1}
              onClick={(e) => {
                if (isDisables == false) {
                  checkAns(e, 1);
                }
              }}
            >
              a
            </p>
            <p
              className="flex flex-col py-2 px-4 rounded font-semibold text-zinc-800 "
              ref={option2}
              onClick={(e) => {
                if (isDisables == false) {
                  checkAns(e, 2);
                }
              }}
            >
              b
            </p>
            <p
              className="flex flex-col py-2 px-4 rounded font-semibold text-zinc-800"
              ref={option3}
              onClick={(e) => {
                if (isDisables == false) {
                  checkAns(e, 3);
                }
              }}
            >
              c
            </p>
            <p
              className="flex flex-col py-2 px-4 rounded font-semibold text-zinc-800"
              ref={option4}
              onClick={(e) => {
                if (isDisables == false) {
                  checkAns(e, 4);
                }
              }}
            >
              d
            </p>
          </div>
          <div className="mt-12 flex justify-between items-center">
            <Link
              href={"/"}
              className="text-primary px-4 py-1 rounded opacity-0"
            >
              &larr; Previous
            </Link>
          { index >= length-1 ? <button
              className="bg-primary text-white px-4 py-1 rounded"
              onClick={() => {
                alert(`Your Score is ${score}`)
              }}
            >
              Show score
            </button> :  <button
              className="bg-primary text-white px-4 py-1 rounded"
              onClick={() => {
                handleIncrement();
              }}
            >
              Next &rarr;
            </button>}
          </div>
        </div>
      </div>
    </div>
  );
}
