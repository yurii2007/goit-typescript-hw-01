'use client';

import { Form } from '../ui/form';
import { StudentList } from '../ui/student-list';

export default function StudentIntroFeature() {
  return (
    <div className="h-full">
      <div className="w-full items-center flex flex-col  px-4 mt-8">
        <h1 className="text-2xl text-gray-200 font-semibold mb-4">
          Introduce Yourself
        </h1>
        <div className="w-[700px] items-center flex justify-center ">
          <Form />
        </div>
        <h1 className="text-2xl text-gray-200 font-semibold mt-8 mb-4">
          Meet The Students
        </h1>
        <div className=" ">
          <StudentList />
        </div>
      </div>
    </div>
  );
}
