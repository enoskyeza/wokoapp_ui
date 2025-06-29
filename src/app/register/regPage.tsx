'use client'
import React, {useEffect, useState} from "react";
// import dynamic from 'next/dynamic'
import {useRegistrationData} from "@/components/Contexts/regDataProvider";
import Image from "next/image";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Play, Users, Clock, ArrowRight} from 'lucide-react';
import Link from 'next/link';

interface Program {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    video: string;
    category: string;
    duration: string;
    age: string;
    participants: number;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    featured: boolean;
}

const mockPrograms: Program[] = [
    {
        id: '1',
        title: 'Creative Toy Festival',
        description: 'Learn to create innovative toys using sustainable materials and modern design principles.',
        thumbnail: 'https://images.pexels.com/photos/298825/pexels-photo-298825.jpeg?auto=compress&cs=tinysrgb&w=500',
        video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        category: 'Festivals',
        duration: '2 Days',
        participants: 245,
        level: 'Beginner',
        age: '3-20 Years ',
        featured: true
    },
    {
        id: '2',
        title: 'Mentorship Program',
        description: 'Develop essential leadership skills through one-on-one mentorship and practical exercises.',
        thumbnail: 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=500',
        video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        category: 'Technology',
        duration: '12 weeks',
        participants: 189,
        level: 'Intermediate',
        age: '3-17 Years ',
        featured: true
    },
    {
        id: '3',
        title: 'Digital Skills Bootcamp',
        description: 'Master modern digital tools and technologies to enhance your professional capabilities.',
        thumbnail: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=500',
        video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        category: 'Technology',
        duration: '6 weeks',
        participants: 312,
        level: 'Advanced',
        age: '13-19 Years ',
        featured: false
    },
    {
        id: '4',
        title: 'Toy Making Workshop',
        description: 'Transform your business ideas into reality with comprehensive startup guidance.',
        thumbnail: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=500',
        video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        category: 'Festivals',
        duration: '2 Days weeks',
        participants: 156,
        level: 'Intermediate',
        age: '3-17Years',
        featured: false
    }
];

const categories = ['All', 'Festivals', 'Leadership', 'Technology', "School"];


export default function RegisterPage() {

    const [programs, setPrograms] = useState<Program[]>(mockPrograms);

    const era = false
    if(era){
        setPrograms(mockPrograms.map(program => {
            program.duration = '12 weeks'
            program.participants = 312
            program.level = 'Advanced'
            program.age = '13-19 Years '
            program.featured = false
            return program
        }))
    }

    const {isLoading, error, setActiveFilter
    } = useRegistrationData()


    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Beginner':
                return 'bg-green-100 text-green-800';
            case 'Intermediate':
                return 'bg-yellow-100 text-yellow-800';
            case 'Advanced':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };


    // const {
    //     programs, isLoading, error,
    //     selectedProgram, setSelectedProgram,
    //     started, setStarted, setActiveFilter
    // } = useRegistrationData()


    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredPrograms, setFilteredPrograms] = useState<Program[]>(mockPrograms);

    useEffect(() => {
        if (selectedCategory === 'All') {
            setFilteredPrograms(programs);
        } else {
            setFilteredPrograms(programs.filter(program => program.category === selectedCategory));
        }
    }, [selectedCategory, programs]);


    useEffect(() => {
        setActiveFilter(true)
    }, [setActiveFilter])

    if (isLoading) return <p>Loading programs…</p>
    if (error) return <p className="text-red-500">Error loading programs</p>

    return (
        <div className="w-full px-8 sm:py-8 text-center text-white space-y-6">
            <div className="flex justify-center">
                <Image
                    src="/logo.png"
                    alt="WokoApp Logo"
                    width={100}
                    height={60}
                    priority
                />
            </div>

            {/* Hero Section */}
            <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-3">
                        Explore our
                        <span className="text-orange-400"> Impactful Programs</span>
                    </h2>
                    <p className="text-lg text-gray-100 ">
                        Join Wokober in transforming education through creativity, hands‑on learning, and community engagement.
                    </p>
                    {/*<div className="flex flex-wrap justify-center gap-4 mb-12">*/}
                    {/*    <div className="bg-white rounded-lg p-4 shadow-md border border-blue-100">*/}
                    {/*        <div className="text-2xl font-bold text-blue-600">500+</div>*/}
                    {/*        <div className="text-sm text-gray-600">Programs Available</div>*/}
                    {/*    </div>*/}
                    {/*    <div className="bg-white rounded-lg p-4 shadow-md border border-blue-100">*/}
                    {/*        <div className="text-2xl font-bold text-blue-600">10k+</div>*/}
                    {/*        <div className="text-sm text-gray-600">Students Enrolled</div>*/}
                    {/*    </div>*/}
                    {/*    <div className="bg-white rounded-lg p-4 shadow-md border border-blue-100">*/}
                    {/*        <div className="text-2xl font-bold text-blue-600">95%</div>*/}
                    {/*        <div className="text-sm text-gray-600">Success Rate</div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>

            {/* Programs Section */}
            <section className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto ">
                    <div className="flex flex-col  sm:flex-row justify-center items-center mb-12">

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                            {categories.map((category) => (
                                <Button
                                      key={category}
                                      {...(selectedCategory === category
                                        ? { color: "white" }
                                        : { outline: true })}
                                      className={
                                        selectedCategory === category
                                          ? "!text-black"
                                          : "!text-white border-white"
                                      }
                                      onClick={() => setSelectedCategory(category)}
                                    >
                                      {category}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPrograms.map((program) => (
                            <Card key={program.id}
                                  className="group hover:shadow-xl transition-all duration-300 border-blue-100 hover:border-blue-200 bg-white">
                                <div className="relative">
                                    <img
                                        src={program.thumbnail}
                                        alt={program.title}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                    />
                                    <div
                                        className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center">
                                        <Play className="w-12 h-12 text-white"/>
                                    </div>
                                    {program.featured && (
                                        <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                                            Featured
                                        </Badge>
                                    )}
                                    <Badge className={`absolute top-3 right-3 ${getLevelColor(program.level)}`}>
                                        {program.age}
                                    </Badge>
                                </div>

                                <CardHeader className="pb-3 text-black">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                                            {program.category}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                        {program.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm leading-relaxed">
                                        {program.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4"/>
                                            <span>{program.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4"/>
                                            <span>{program.participants} enrolled</span>
                                        </div>
                                    </div>

                                    <Link href={`/programs/${program.id}`}>
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 group">
                                            Register
                                            <ArrowRight
                                                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/>
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <div className="flex items-center justify-center space-x-4">
                <div>
                    <Link
                        href={'/dashboard'}
                        className="w-full text-white font-semibold px-6  rounded-lg hover:text-green-400 underline"
                    >login</Link>
                </div>

            </div>
        </div>
    )
}
