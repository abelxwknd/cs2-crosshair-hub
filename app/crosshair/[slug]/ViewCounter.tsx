"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";


export default function ViewCounter({
  id,
  views
}: {
  id:number;
  views:number;
}) {


useEffect(() => {

const key = `viewed-${id}`;

const old = localStorage.getItem(key);


if(!old){

supabase
.from("approved_crosshairs")
.update({
 views: views + 1
})
.eq("id",id)
.then(()=>{

localStorage.setItem(
key,
"true"
);

});

}


},[]);


return null;

}