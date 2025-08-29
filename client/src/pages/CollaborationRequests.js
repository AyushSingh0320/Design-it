// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const CollaborationRequests = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   const fetchRequests = async () => {
//     try {
//       const response = await axios.get('/api/collaboration/requests');
//       setRequests(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch collaboration requests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAccept = async (requestId) => {
//     try {
//       await axios.put(`/api/collaboration/requests/${requestId}/accept`);
//       toast.success('Request accepted successfully');
//       fetchRequests();
//     } catch (error) {
//       toast.error('Failed to accept request');
//     }
//   };

//   const handleReject = async (requestId) => {
//     try {
//       await axios.put(`/api/collaboration/requests/${requestId}/reject`);
//       toast.success('Request rejected successfully');
//       fetchRequests();
//     } catch (error) {
//       toast.error('Failed to reject request');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
//         <div className="px-4 py-5 sm:px-6">
//           <h3 className="text-lg leading-6 font-medium text-gray-900">
//             Collaboration Requests
//           </h3>
//           <p className="mt-1 max-w-2xl text-sm text-gray-500">
//             Manage your collaboration requests and connect with other designers.
//           </p>
//         </div>

//         <div className="border-t border-gray-200">
//           {requests.length === 0 ? (
//             <div className="px-4 py-5 sm:px-6 text-center">
//               <p className="text-gray-500">No collaboration requests at the moment.</p>
//               <Link
//                 to="/gallery"
//                 className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
//               >
//                 Browse Gallery
//               </Link>
//             </div>
//           ) : (
//             <ul className="divide-y divide-gray-200">
//               {requests.map((request) => (
//                 <li key={request._id} className="px-4 py-4 sm:px-6">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <img
//                         src={request.from.profileImage || '/icon.png'}
//                         alt={request.from.name}
//                         className="h-10 w-10 rounded-full"
//                       />
//                       <div className="ml-4">
//                         <h4 className="text-sm font-medium text-gray-900">
//                           <Link
//                             to={`/profile/${request.from.id}`}
//                             className="hover:text-primary-600"
//                           >
//                             {request.from.name}
//                           </Link>
//                         </h4>
//                         <p className="text-sm text-gray-500">{request.message}</p>
//                       </div>
//                     </div>
//                     <div className="flex space-x-3">
//                       <button
//                         onClick={() => handleAccept(request._id)}
//                         className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//                       >
//                         Accept
//                       </button>
//                       <button
//                         onClick={() => handleReject(request._id)}
//                         className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//                       >
//                         Reject
//                       </button>
//                     </div>
//                   </div>
//                   <div className="mt-2">
//                     <div className="flex items-center text-sm text-gray-500">
//                       <svg
//                         className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//                         />
//                       </svg>
//                       <p>
//                         Received on{' '}
//                         {new Date(request.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CollaborationRequests; 