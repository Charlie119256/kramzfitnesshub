'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MemberNavbar from '../../../components/member/MemberNavbar';
import {
  PlayIcon,
  ClockIcon,
  FireIcon,
  UserGroupIcon,
  HeartIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

export default function MemberExercises() {
  const [exercises, setExercises] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userRole && userRole !== 'member') {
      router.push('/login');
      return;
    }

    fetchExercises();
  }, [router]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      
      // Static data for exercises page
      const staticData = {
        categories: [
          { id: 'all', name: 'All Exercises', count: 24 },
          { id: 'cardio', name: 'Cardio', count: 8 },
          { id: 'strength', name: 'Strength Training', count: 10 },
          { id: 'flexibility', name: 'Flexibility', count: 6 }
        ],
        exercises: [
          {
            id: 1,
            name: "Treadmill Running",
            category: "cardio",
            duration: "30 min",
            difficulty: "Beginner",
            calories: 300,
            description: "Improve cardiovascular fitness with treadmill running",
            equipment: "Treadmill",
            isFavorite: true,
            isBookmarked: false
          },
          {
            id: 2,
            name: "Bench Press",
            category: "strength",
            duration: "45 min",
            difficulty: "Intermediate",
            calories: 250,
            description: "Build chest strength with bench press exercises",
            equipment: "Bench, Barbell",
            isFavorite: false,
            isBookmarked: true
          },
          {
            id: 3,
            name: "Yoga Stretches",
            category: "flexibility",
            duration: "20 min",
            difficulty: "Beginner",
            calories: 120,
            description: "Improve flexibility and reduce stress with yoga stretches",
            equipment: "Yoga Mat",
            isFavorite: true,
            isBookmarked: false
          },
          {
            id: 4,
            name: "Cycling",
            category: "cardio",
            duration: "40 min",
            difficulty: "Beginner",
            calories: 350,
            description: "Low-impact cardiovascular exercise on stationary bike",
            equipment: "Stationary Bike",
            isFavorite: false,
            isBookmarked: false
          },
          {
            id: 5,
            name: "Squats",
            category: "strength",
            duration: "25 min",
            difficulty: "Beginner",
            calories: 200,
            description: "Build leg strength with bodyweight squats",
            equipment: "None (Bodyweight)",
            isFavorite: true,
            isBookmarked: true
          },
          {
            id: 6,
            name: "Stretching Routine",
            category: "flexibility",
            duration: "15 min",
            difficulty: "Beginner",
            calories: 80,
            description: "Basic stretching routine for improved flexibility",
            equipment: "None",
            isFavorite: false,
            isBookmarked: false
          }
        ],
        recentWorkouts: [
          {
            id: 1,
            name: "Morning Cardio",
            date: "2024-01-20",
            duration: "45 min",
            exercises: ["Treadmill Running", "Cycling"],
            calories: 450
          },
          {
            id: 2,
            name: "Strength Training",
            date: "2024-01-18",
            duration: "60 min",
            exercises: ["Bench Press", "Squats"],
            calories: 400
          }
        ]
      };

      setExercises(staticData);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredExercises = exercises?.exercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const toggleFavorite = (exerciseId) => {
    setExercises(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, isFavorite: !exercise.isFavorite }
          : exercise
      )
    }));
  };

  const toggleBookmark = (exerciseId) => {
    setExercises(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, isBookmarked: !exercise.isBookmarked }
          : exercise
      )
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  if (!exercises) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavbar activeMenu="exercises" />
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Exercises
            </h1>
            <p className="text-gray-600 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Discover and track your favorite exercises
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex gap-2">
                {exercises.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Exercises List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Available Exercises ({filteredExercises.length})
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredExercises.map((exercise) => (
                      <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {exercise.name}
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleFavorite(exercise.id)}
                              className={`p-1 rounded ${
                                exercise.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <HeartIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleBookmark(exercise.id)}
                              className={`p-1 rounded ${
                                exercise.isBookmarked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
                              }`}
                            >
                              <BookmarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {exercise.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>{exercise.duration}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FireIcon className="h-4 w-4 mr-1" />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>{exercise.calories} cal</span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>{exercise.difficulty}</span>
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Equipment: {exercise.equipment}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200">
                            <PlayIcon className="h-4 w-4 mr-1" />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>Start</span>
                          </button>
                          <button className="inline-flex items-center justify-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors duration-200">
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>Details</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredExercises.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        No exercises found matching your criteria.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Workouts */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Recent Workouts
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {exercises.recentWorkouts.map((workout) => (
                      <div key={workout.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {workout.name}
                          </h3>
                          <span className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {new Date(workout.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>{workout.duration}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FireIcon className="h-4 w-4 mr-1" />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>{workout.calories} cal</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-xs text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Exercises: {workout.exercises.join(', ')}
                          </p>
                        </div>
                        
                        <button className="w-full inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200">
                          <PlayIcon className="h-4 w-4 mr-1" />
                          <span style={{ fontFamily: 'Poppins, sans-serif' }}>Repeat Workout</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      <span style={{ fontFamily: 'Poppins, sans-serif' }}>Create Custom Workout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 