'use client'
import React, {useEffect} from "react";
import dynamic from 'next/dynamic'
import {useRegistrationData} from "@/components/Contexts/regDataProvider";
import Image from "next/image";
import Link from "next/link";

const formMap: Record<string, React.ComponentType> = {
  tf: dynamic(() => import('./forms/tfForm'), { ssr: false }),
  mp: dynamic(() => import('./forms/mpForm'), { ssr: false }),
  gen: dynamic(() => import('./forms/generalForm'), { ssr: false }),  // ← new
}

export default function RegisterPage() {
  const {
    programs, isLoading, error,
    selectedProgram, setSelectedProgram,
      started, setStarted, setActiveFilter
  } = useRegistrationData()


  useEffect(() => {
    setActiveFilter(true)
  }, [setActiveFilter])

  if (isLoading) return <p>Loading programs…</p>
  if (error)     return <p className="text-red-500">Error loading programs</p>

  return (
    <div>
      {!started ? (
        <div className="max-w-md w-full px-8 sm:px-0 text-center text-white space-y-6">

          <div className="flex justify-center">
            <Image
                src="/logo.png"
                alt="WokoApp Logo"
                width={100}
                height={60}
                priority
            />
          </div>
           {/*<img src="/logo.png" alt="Wokober Logo" className="mx-auto h-24 w-auto" />*/}
           <h1 className="text-4xl font-bold">Wokober Registrations Panel</h1>
           <p className="text-xl">Choose Program</p>

          <select
            value={selectedProgram?.id ?? ''}
            onChange={e => {
              const p = programs.find(x => x.id === +e.target.value) ?? null
              setSelectedProgram(p)
            }}
            className="w-full p-3 rounded-lg text-lg text-black"
          >
            <option value="" disabled>Pick a program…</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            disabled={!selectedProgram}
            onClick={() => setStarted(true)}
             className="w-full bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >Next</button>
          <div>
          <Link
              href={'/dashboard'}
             className="w-full text-white font-semibold px-6  rounded-lg hover:text-green-400 underline"
          >login</Link>
          </div>
        </div>
      ) : (
        <div>
          {/*<button onClick={()=>{ setStarted(false); setSelectedProgram(null) }}>*/}
          {/*  &larr; Back*/}
          {/*</button>*/}
          {selectedProgram && (() => {
            const key = selectedProgram?.type?.form_key || 'gen'
            const Form = formMap[key]
            return Form
              ? <Form />
              : <p>{`No form for "${key}"`}</p>
          })()}
        </div>
      )}
    </div>
  )
}
