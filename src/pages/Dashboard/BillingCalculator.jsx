// import React, { useState, useEffect } from 'react';
// import { db } from '../firebase'; // Import the initialized firebase instance
// import { collection, getDocs, addDoc } from 'firebase/firestore';
// import jsPDF from 'jspdf';
// import './BillingCalculator.css'; // Import the CSS file

// const BillingCalculator = () => {
//   const [products, setProducts] = useState([]);
//   const [billingDetails, setBillingDetails] = useState({
//     items: [],
//     totalAmount: 0,
//     discountPercentage: 0,
//     discountedTotal: 0,
//     taxPercentage: 0,
//     grandTotal: 0,
//   });

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const productsCollectionRef = collection(db, 'products');
//       try {
//         const querySnapshot = await getDocs(productsCollectionRef);
//         const fetchedProducts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setProducts(fetchedProducts);
//         initializeBillingDetails(fetchedProducts);
//       } catch (error) {
//         console.error('Error fetching products: ', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const initializeBillingDetails = (fetchedProducts) => {
//     const initialItems = fetchedProducts.map(product => ({
//       productId: product.id,
//       name: product.name,
//       quantity: 0,
//       price: product.price,
//     }));
//     setBillingDetails(prevState => ({
//       ...prevState,
//       items: initialItems,
//     }));
//   };

//   const handleQuantityChange = (productId, quantity) => {
//     const updatedItems = billingDetails.items.map(item =>
//       item.productId === productId ? { ...item, quantity } : item
//     );
//     updateBillingDetails(updatedItems);
//   };

//   const updateBillingDetails = (updatedItems) => {
//     const totalAmount = updatedItems.reduce((total, item) => {
//       return total + (item.price * item.quantity);
//     }, 0);

//     const discountPercentage = billingDetails.discountPercentage;
//     const discountedTotal = totalAmount * (1 - discountPercentage / 100);

//     const taxPercentage = billingDetails.taxPercentage;
//     const taxAmount = discountedTotal * (taxPercentage / 100);

//     const grandTotal = discountedTotal + taxAmount;

//     setBillingDetails(prevState => ({
//       ...prevState,
//       items: updatedItems,
//       totalAmount,
//       discountedTotal,
//       grandTotal,
//     }));
//   };

//   const handleDiscountChange = (event) => {
//     const discountPercentage = parseInt(event.target.value) || 0;
//     setBillingDetails(prevState => ({
//       ...prevState,
//       discountPercentage,
//     }));
//   };

//   const handleTaxChange = (event) => {
//     const taxPercentage = parseInt(event.target.value) || 0;
//     setBillingDetails(prevState => ({
//       ...prevState,
//       taxPercentage,
//     }));
//   };

//   useEffect(() => {
//     updateBillingDetails(billingDetails.items);
//   }, [billingDetails.discountPercentage, billingDetails.taxPercentage]);

//   const handleSave = async () => {
//     const billingDocRef = collection(db, 'billing');
//     try {
//       await addDoc(billingDocRef, billingDetails);
//       console.log('Billing details saved successfully in Firestore');
//     } catch (error) {
//       console.error('Error saving billing details: ', error);
//     }

//     const doc = new jsPDF();

//     // Add Header
//     doc.setFontSize(18);
//     doc.text('Company Name', 10, 10);
//     doc.setFontSize(12);
//     doc.text('Company Address', 10, 20);
//     doc.text('Contact: 123-456-7890', 10, 30);
    
//     // Add Date
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 10);

//     // Add Table Headers
//     doc.setFontSize(14);
//     doc.text('Item', 10, 50);
//     doc.text('Quantity', 70, 50);
//     doc.text('Price', 120, 50);
//     doc.text('Total', 170, 50);
    
//     // Add Table Rows
//     const filteredItems = billingDetails.items.filter(item => item.quantity > 0);
//     filteredItems.forEach((item, index) => {
//       const y = 60 + index * 10;
//       doc.text(item.name, 10, y);
//       doc.text(item.quantity.toString(), 70, y);
//       doc.text(`₹${item.price.toFixed(2)}`, 120, y);
//       doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 170, y);
//     });

//     // Add Summary
//     const summaryStartY = 70 + filteredItems.length * 10;
//     doc.text(`Total Amount: ₹${billingDetails.totalAmount.toFixed(2)}`, 10, summaryStartY);
//     doc.text(`Discount: ${billingDetails.discountPercentage}%`, 10, summaryStartY + 10);
//     doc.text(`Discounted Total: ₹${billingDetails.discountedTotal.toFixed(2)}`, 10, summaryStartY + 20);
//     doc.text(`Tax: ${billingDetails.taxPercentage}%`, 10, summaryStartY + 30);
//     doc.text(`Tax Amount: ₹${((billingDetails.discountedTotal * billingDetails.taxPercentage) / 100).toFixed(2)}`, 10, summaryStartY + 40);
//     doc.text(`Grand Total: ₹${billingDetails.grandTotal.toFixed(2)}`, 10, summaryStartY + 50);

//     // Add Footer
//     doc.setFontSize(10);
//     doc.text('Thank you for your business!', 10, 290);
//     doc.text('Please contact us if you have any questions about this invoice.', 10, 300);

//     doc.save('billing_details.pdf');
//   };

//   return (
//     <div className="billing-page">
//       <div className="billing-container">
//         <h2>Billing Calculator</h2>
//         <ul className="billing-list">
//           {products.map(product => (
//             <li key={product.id}>
//               {product.name} - ₹{product.price.toFixed(2)} per unit
//               <input
//                 type="number"
//                 min="0"
//                 value={billingDetails.items.find(item => item.productId === product.id)?.quantity || 0}
//                 onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
//               />
//             </li>
//           ))}
//         </ul>
//         <div className="billing-details">
//           <label>Discount Percentage:</label>
//           <input
//             type="number"
//             min="0"
//             max="100"
//             value={billingDetails.discountPercentage}
//             onChange={handleDiscountChange}
//           />
//           %
//         </div>
//         <div className="billing-details">
//           <label>Tax Percentage:</label>
//           <input
//             type="number"
//             min="0"
//             max="100"
//             value={billingDetails.taxPercentage}
//             onChange={handleTaxChange}
//           />
//           %
//         </div>
//         <div className="billing-summary">
//           <h3>Total Amount: ₹{billingDetails.totalAmount.toFixed(2)}</h3>
//           <p>Discounted Total: ₹{billingDetails.discountedTotal.toFixed(2)}</p>
//           <p>Tax Amount: ₹{((billingDetails.discountedTotal * billingDetails.taxPercentage) / 100).toFixed(2)}</p>
//           <h3>Grand Total: ₹{billingDetails.grandTotal.toFixed(2)}</h3>
//         </div>
//         <button className="save-button" onClick={handleSave}>Save and Generate PDF</button>
//       </div>
//     </div>
//   );
// };

// export default BillingCalculator;
// import React, { useState, useEffect } from 'react';
// import { db } from '../firebase'; // Import the initialized firebase instance
// import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import './BillingCalculator.css'; // Import the CSS file

// const BillingCalculator = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [billingDetails, setBillingDetails] = useState({
//     totalAmount: 0,
//     discountPercentage: '',
//     discountedTotal: 0,
//     cgstAmount: 0,
//     sgstAmount: 0,
//     igstAmount: 0,
//     grandTotal: 0,
//   });
//   const [customerName, setCustomerName] = useState('');
//   const [customerState, setCustomerState] = useState(''); // New state for customer state
//   const [businessState, setBusinessState] = useState('YourBusinessState'); // State where the business is located
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const productsCollectionRef = collection(db, 'products');
//       try {
//         const querySnapshot = await getDocs(productsCollectionRef);
//         const fetchedProducts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setProducts(fetchedProducts);
//       } catch (error) {
//         console.error('Error fetching products: ', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleQuantityChange = (productId, quantity) => {
//     const updatedCart = cart.map(item =>
//       item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
//     );
//     setCart(updatedCart);
//     updateBillingDetails(updatedCart);
//   };

//   const updateBillingDetails = (updatedCart) => {
//     const totalAmount = updatedCart.reduce((total, item) => {
//       return total + (item.price * item.quantity);
//     }, 0);

//     const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
//     const discountedTotal = totalAmount * (1 - discountPercentage / 100);

//     let cgstAmount = 0;
//     let sgstAmount = 0;
//     let igstAmount = 0;
//     if (customerState === businessState) {
//       cgstAmount = discountedTotal * 0.09;
//       sgstAmount = discountedTotal * 0.09;
//     } else {
//       igstAmount = discountedTotal * 0.18;
//     }

//     const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

//     setBillingDetails(prevState => ({
//       ...prevState,
//       totalAmount,
//       discountedTotal,
//       cgstAmount,
//       sgstAmount,
//       igstAmount,
//       grandTotal,
//     }));
//   };

//   const handleDiscountChange = (event) => {
//     const discountPercentage = event.target.value;
//     setBillingDetails(prevState => ({
//       ...prevState,
//       discountPercentage,
//     }));
//   };

//   useEffect(() => {
//     updateBillingDetails(cart);
//   }, [billingDetails.discountPercentage, customerState]);

//   const handleSave = async () => {
//     const billingDocRef = collection(db, 'billing');
//     try {
//       await addDoc(billingDocRef, { 
//         ...billingDetails, 
//         customerName,
//         customerState,
//         date: Timestamp.fromDate(new Date()) // Add the current date
//       });
//       console.log('Billing details saved successfully in Firestore');
//     } catch (error) {
//       console.error('Error saving billing details: ', error);
//     }

//     const doc = new jsPDF();

//     // doc.addImage(imgData, 'JPEG', 10, 10, 30, 30);
//     doc.setFontSize(14);
//     doc.text('Tamizha Software solutions', 40, 20); // Adjust position based on logo size
//     doc.setFontSize(10);
//     doc.text('Thiruthangal', 40, 28);
//     doc.text('Contact: 123-456-7890', 40, 35);

//     // Add Date
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 20);

//     // Add Customer Name
//     doc.text(`Customer Name: ${customerName}`, 150, 28);

//     // Prepare Table Body
//     const tableBody = cart
//       .filter(item => item.quantity > 0)
//       .map(item => [
//         item.name,
//         item.quantity.toString(),
//         `Rs. ${item.price.toFixed(2)}`,
//         `Rs. ${(item.price * item.quantity).toFixed(2)}`
//       ]);

//     // Add Summary Rows
//     tableBody.push(
//       [
//         { content: 'Total Amount:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.totalAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],  
//       [
//         { content: 'Discounted Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.discountedTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'CGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.cgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'SGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.sgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'IGST (18%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.igstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Grand Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.grandTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } }
//       ]
//     );

//     // Add Table
//     doc.autoTable({
//       startY: 50, // Adjust starting Y position to leave space for logo and header
//       head: [['Item', 'Quantity', 'Price', 'Total']],
//       body: tableBody,
//       didDrawCell: (data) => {
//         // Draw underline and break line for the Grand Total row
//         if (data.row.index === tableBody.length - 1 && data.column.index === 3) {
//           const doc = data.doc;
//           const cell = data.cell;
//           const textPos = cell.textPos;
//           doc.setDrawColor(0);
//           doc.setLineWidth(0.5);
//           doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height); // underline
//           doc.text(' ', cell.x + cell.width, cell.y + cell.height + 10); // break line
//         }
//       }
//     });

//     // Add Footer
//     const finalY = doc.lastAutoTable.finalY || 10;
//     doc.setFontSize(10);
//     doc.text('Thank you for your business!', 10, finalY + 10);
//     doc.text('Please contact us if you have any questions about this invoice.', 10, finalY + 20);

//     doc.save('billing_details.pdf');
//   };

//   const handleSearchChange = (event) => {
//     const searchTerm = event.target.value.toLowerCase();
//     setSearchTerm(searchTerm);
//     const filtered = products.filter(product => product.name.toLowerCase().includes(searchTerm));
//     setFilteredProducts(filtered);
//   };

//   const handleAddToCart = (product) => {
//     const productInCart = cart.find(item => item.productId === product.id);
//     if (!productInCart) {
//       setCart(prevCart => [...prevCart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
//     } else {
//       const updatedCart = cart.map(item =>
//         item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
//       );
//       setCart(updatedCart);
//     }
//     updateBillingDetails(cart);
//   };

//   return (
//     <div className="billing-page">
//       <div className="billing-container">
//         <h2>Billing Calculator</h2>
//         <div className="search-bar">
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//           />
//         </div>
//         <div className="customer-name">
//           <label>Customer Name:</label>
//           <input
//             type="text"
//             value={customerName}
//             onChange={(e) => setCustomerName(e.target.value)}
//           />
//           <label>Customer State:</label>
//           <input
//             type="text"
//             value={customerState}
//             onChange={(e) => setCustomerState(e.target.value)}
//           />
//         </div>
//         <ul className="product-list">
//           {searchTerm && filteredProducts.map(product => (
//             <li key={product.id} onClick={() => handleAddToCart(product)}>
//               {product.name} - ₹{product.price.toFixed(2)}
//             </li>
//           ))}
//         </ul>
//         <ul className="cart-list">
//           {cart.map(item => (
//             <li key={item.productId}>
//               {item.name} - ₹{item.price.toFixed(2)} x 
//               <input
//                 type="number"
//                 min="1"
//                 value={item.quantity}
//                 onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
//               />
//               = ₹{(item.price * item.quantity).toFixed(2)}
//             </li>
//           ))}
//         </ul>
//         <div className="billing-details">
//           <label>Discount Percentage:</label>
//           <input
//             type="number"
//             min="0"
//             max="100"
//             value={billingDetails.discountPercentage}
//             onChange={handleDiscountChange}
//           />
//           %
//         </div>
//         <div className="billing-summary">
//           <h3>Total Amount: ₹{billingDetails.totalAmount.toFixed(2)}</h3>
//           <p>Discounted Total: ₹{billingDetails.discountedTotal.toFixed(2)}</p>
//           <p>CGST (9%): ₹{billingDetails.cgstAmount.toFixed(2)}</p>
//           <p>SGST (9%): ₹{billingDetails.sgstAmount.toFixed(2)}</p>
//           <p>IGST (18%): ₹{billingDetails.igstAmount.toFixed(2)}</p>
//           <h3>Grand Total: ₹{billingDetails.grandTotal.toFixed(2)}</h3>
//         </div>
//         <button className="save-button" onClick={handleSave}>Save and Generate PDF</button>
//       </div>
//     </div>
//   );
// };

// export default BillingCalculator;



// import React, { useState, useEffect } from 'react';
// import { db } from '../firebase'; // Import the initialized firebase instance
// import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import './BillingCalculator.css'; // Import the CSS file

// const BillingCalculator = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [billingDetails, setBillingDetails] = useState({
//     totalAmount: 0,
//     discountPercentage: '',
//     discountedTotal: 0,
//     cgstAmount: 0,
//     sgstAmount: 0,
//     igstAmount: 0,
//     grandTotal: 0,
//   });
//   const [customerName, setCustomerName] = useState('');
//   const [customerState, setCustomerState] = useState(''); // New state for customer state
//   const [businessState, setBusinessState] = useState('YourBusinessState'); // State where the business is located
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const productsCollectionRef = collection(db, 'products');
//       try {
//         const querySnapshot = await getDocs(productsCollectionRef);
//         const fetchedProducts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setProducts(fetchedProducts);
//       } catch (error) {
//         console.error('Error fetching products: ', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleQuantityChange = (productId, quantity) => {
//     const updatedCart = cart.map(item =>
//       item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
//     );
//     setCart(updatedCart);
//     updateBillingDetails(updatedCart);
//   };

//   const updateBillingDetails = (updatedCart) => {
//     const totalAmount = updatedCart.reduce((total, item) => {
//       return total + (item.price * item.quantity);
//     }, 0);

//     const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
//     const discountedTotal = totalAmount * (1 - discountPercentage / 100);

//     let cgstAmount = 0;
//     let sgstAmount = 0;
//     let igstAmount = 0;
//     if (customerState === businessState) {
     
//     } else {
//       cgstAmount = discountedTotal * 0.09;
//       sgstAmount = discountedTotal * 0.09;
//       igstAmount = discountedTotal * 0.18;
//     }

//     const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

//     setBillingDetails(prevState => ({
//       ...prevState,
//       totalAmount,
//       discountedTotal,
//       cgstAmount,
//       sgstAmount,
//       igstAmount,
//       grandTotal,
//     }));
//   };

//   const handleDiscountChange = (event) => {
//     const discountPercentage = event.target.value;
//     setBillingDetails(prevState => ({
//       ...prevState,
//       discountPercentage,
//     }));
//   };

//   useEffect(() => {
//     updateBillingDetails(cart);
//   }, [billingDetails.discountPercentage, customerState]);

//   const handleSave = async () => {
//     const billingDocRef = collection(db, 'billing');
//     try {
//       await addDoc(billingDocRef, { 
//         ...billingDetails, 
//         customerName,
//         customerState,
//         date: Timestamp.fromDate(new Date()) // Add the current date
//       });
    
//       console.log('Billing details saved successfully in Firestore');
//     } catch (error) {
//       console.error('Error saving billing details: ', error);
//     }
//     window.location.reload();
//     const doc = new jsPDF();
  
//     //  doc.addImage(imgData, 'JPEG', 10, 10, 30, 30);
//     doc.setFontSize(14);
//     doc.text('Tamizha Software solutions', 40, 20); // Adjust position based on logo size
//     doc.setFontSize(10);
//     doc.text('Thiruthangal', 40, 28);
//     doc.text('Contact: 123-456-7890', 40, 35);

//     // Add Date
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 20);

//     // Add Customer Name
//     doc.text(`Customer Name: ${customerName}`, 150, 28);

//     // Prepare Table Body
//     const tableBody = cart
//       .filter(item => item.quantity > 0)
//       .map(item => [
//         item.name,
//         item.quantity.toString(),
//         `Rs. ${item.price.toFixed(2)}`,
//         `Rs. ${(item.price * item.quantity).toFixed(2)}`
//       ]);

//     // Add Summary Rows
//     tableBody.push(
//       [
//         { content: 'Total Amount:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.totalAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Discounted Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.discountedTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'CGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.cgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'SGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.sgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'IGST (18%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.igstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Grand Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.grandTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } }
//       ]
//     );

//     // Add Table
//     doc.autoTable({
//       startY: 50, // Adjust starting Y position to leave space for logo and header
//       head: [['Item', 'Quantity', 'Price', 'Total']],
//       body: tableBody,
//       styles: {
//         lineColor: [0, 0, 0],
//         lineWidth: 0.1,
//         font: "helvetica",
//         fontSize: 10,
//         cellPadding: 3,
//         textColor: [0, 0, 0],
//       },
//       headStyles: {
//         fillColor: [200, 200, 200],
//         textColor: [0, 0, 0],
//         fontStyle: 'bold',
//       },
//       bodyStyles: {
//         fillColor: [255, 255, 255],
//       },
//       alternateRowStyles: {
//         fillColor: [240, 240, 240],
//       },
//       tableLineWidth: 0.1,
//       tableLineColor: [0, 0, 0],
//       didDrawCell: (data) => {
//         // Draw underline and break line for the Grand Total row
//         if (data.row.index === tableBody.length - 1 && data.column.index === 3) {
//           const doc = data.doc;
//           const cell = data.cell;
//           const textPos = cell.textPos;
//           doc.setDrawColor(0);
//           doc.setLineWidth(0.5);
//           doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height); // underline
//           doc.text(' ', cell.x + cell.width, cell.y + cell.height + 10); // break line
//         }
//       }
//     });

//     // Add Footer
//     const finalY = doc.lastAutoTable.finalY || 10;
//     doc.setFontSize(10);
//     doc.text('Thank you for your business!', 10, finalY + 10);
//     doc.text('Please contact us if you have any questions about this invoice.', 10, finalY + 20);

//     doc.save('billing_details.pdf');
//   };

//   const handleSearchChange = (event) => {
//     const searchTerm = event.target.value.toLowerCase();
//     setSearchTerm(searchTerm);
//     const filtered = products.filter(product => product.name.toLowerCase().includes(searchTerm));
//     setFilteredProducts(filtered);
//   };

//   const handleAddToCart = (product) => {
//     const productInCart = cart.find(item => item.productId === product.id);
//     if (!productInCart) {
//       setCart(prevCart => [...prevCart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
//     } else {
//       const updatedCart = cart.map(item =>
//         item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
//       );
//       setCart(updatedCart);
//     }
//     updateBillingDetails(cart);
//   };

//   return (
//     <div className="billing-page">
//       <div className="billing-container">
//         <h2>Billing Calculator</h2>
//         <div className="search-bar">
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//           />
//         </div>
//         <div className="customer-name">
//           <label>Customer Name:</label>
//           <input
//             type="text"
//             value={customerName}
//             onChange={(e) => setCustomerName(e.target.value)}
//           />
//           <label>Customer State:</label>
//           <input
//             type="text"
//             value={customerState}
//             onChange={(e) => setCustomerState(e.target.value)}
//           />
//         </div>
//         <ul className="product-list">
//           {searchTerm && filteredProducts.map(product => (
//             <li key={product.id} onClick={() => handleAddToCart(product)}>
//               {product.name} - ₹{product.price.toFixed(2)}
//             </li>
//           ))}
//         </ul>
//         <ul className="cart-list">
//           {cart.map(item => (
//             <li key={item.productId}>
//               {item.name} - ₹{item.price.toFixed(2)} x 
//               <input
//                 type="number"
//                 min="1"
//                 value={item.quantity}
//                 onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
//               />
//               = ₹{(item.price * item.quantity).toFixed(2)}
//             </li>
//           ))}
//         </ul>
//         <div className="billing-details">
//           <label>Discount Percentage:</label>
//           <input
//             type="number"
//             min="0"
//             max="100"
//             value={billingDetails.discountPercentage}
//             onChange={handleDiscountChange}
//           />
//           %
//         </div>
//         <div className="billing-summary">
//           <h3>Total Amount: ₹{billingDetails.totalAmount.toFixed(2)}</h3>
//           <p>Discounted Total: ₹{billingDetails.discountedTotal.toFixed(2)}</p>
//           <p>CGST (9%): ₹{billingDetails.cgstAmount.toFixed(2)}</p>
//           <p>SGST (9%): ₹{billingDetails.sgstAmount.toFixed(2)}</p>
//           <p>IGST (18%): ₹{billingDetails.igstAmount.toFixed(2)}</p>
//           <h3>Grand Total: ₹{billingDetails.grandTotal.toFixed(2)}</h3>
//         </div>
//         <button className="save-button" onClick={handleSave}>Save and Generate PDF</button>
//       </div>
//     </div>
//   );
// };

// export default BillingCalculator;
// import React, { useState, useEffect } from 'react';
// import { db } from '../firebase'; // Import the initialized firebase instance
// import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import './BillingCalculator.css'; // Import the CSS file

// const BillingCalculator = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [billingDetails, setBillingDetails] = useState({
//     totalAmount: 0,
//     discountPercentage: '',
//     discountedTotal: 0,
//     cgstAmount: 0,
//     sgstAmount: 0,
//     igstAmount: 0,
//     grandTotal: 0,
//   });
//   const [customerName, setCustomerName] = useState('');
//   const [customerState, setCustomerState] = useState(''); // New state for customer state
//   const [businessState, setBusinessState] = useState('YourBusinessState'); // State where the business is located
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const productsCollectionRef = collection(db, 'products');
//       try {
//         const querySnapshot = await getDocs(productsCollectionRef);
//         const fetchedProducts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setProducts(fetchedProducts);
//       } catch (error) {
//         console.error('Error fetching products: ', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleQuantityChange = (productId, quantity) => {
//     const updatedCart = cart.map(item =>
//       item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
//     );
//     setCart(updatedCart);
//     updateBillingDetails(updatedCart);
//   };

//   const updateBillingDetails = (updatedCart) => {
//     const totalAmount = updatedCart.reduce((total, item) => {
//       return total + (item.price * item.quantity);
//     }, 0);

//     const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
//     const discountedTotal = totalAmount * (1 - discountPercentage / 100);

//     let cgstAmount = 0;
//     let sgstAmount = 0;
//     let igstAmount = 0;
//     if (customerState === businessState) {
//       cgstAmount = discountedTotal * 0.09;
//       sgstAmount = discountedTotal * 0.09;
//     } else {
//       igstAmount = discountedTotal * 0.18;
//     }

//     const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

//     setBillingDetails(prevState => ({
//       ...prevState,
//       totalAmount,
//       discountedTotal,
//       cgstAmount,
//       sgstAmount,
//       igstAmount,
//       grandTotal,
//     }));
//   };

//   const handleDiscountChange = (event) => {
//     const discountPercentage = event.target.value;
//     setBillingDetails(prevState => ({
//       ...prevState,
//       discountPercentage,
//     }));
//   };

//   useEffect(() => {
//     updateBillingDetails(cart);
//   }, [billingDetails.discountPercentage, customerState]);

//   const handleSave = async () => {
//     const billingDocRef = collection(db, 'billing');
//     try {
//       await addDoc(billingDocRef, { 
//         ...billingDetails, 
//         customerName,
//         customerState,
//         date: Timestamp.fromDate(new Date()) // Add the current date
//       });
    
//       console.log('Billing details saved successfully in Firestore');
//     } catch (error) {
//       console.error('Error saving billing details: ', error);
//     }
//     window.location.reload();
//     const doc = new jsPDF();
  
//     //  doc.addImage(imgData, 'JPEG', 10, 10, 30, 30);
//     doc.setFontSize(14);
//     doc.text('Tamizha Software solutions', 40, 20); // Adjust position based on logo size
//     doc.setFontSize(10);
//     doc.text('Thiruthangal', 40, 28);
//     doc.text('Contact: 123-456-7890', 40, 35);

//     // Add Date
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 20);

//     // Add Customer Name
//     doc.text(`Customer Name: ${customerName}`, 150, 28);

//     // Prepare Table Body
//     const tableBody = cart
//       .filter(item => item.quantity > 0)
//       .map(item => [
//         item.name,
//         item.quantity.toString(),
//         `Rs. ${item.price.toFixed(2)}`,
//         `Rs. ${(item.price * item.quantity).toFixed(2)}`
//       ]);

//     // Add Summary Rows
//     tableBody.push(
//       [
//         { content: 'Total Amount:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.totalAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Discounted Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.discountedTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'CGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.cgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'SGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.sgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'IGST (18%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.igstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Grand Total:', colSpan: 3, styles: { halign: 'right', fillColor: [0, 0, 0], textColor: [255, 255, 255] } },
//         { content: `Rs. ${billingDetails.grandTotal.toFixed(2)}`, styles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' } }
//       ]
//     );

//     doc.autoTable({
//       head: [['Item Name', 'Quantity', 'Price', 'Total']],
//       body: tableBody,
//       startY: 40,
//     });

//     doc.save('billing_invoice.pdf');
//   };

//   const handleSearch = (event) => {
//     const value = event.target.value.toLowerCase();
//     setSearchTerm(value);

//     const filtered = products.filter(product => 
//       product.name.toLowerCase().includes(value)
//     );
//     setFilteredProducts(filtered);
//   };

//   const handleAddToCart = (product) => {
//     const existingItem = cart.find(item => item.productId === product.id);
//     if (existingItem) {
//       const updatedCart = cart.map(item =>
//         item.productId === product.id
//           ? { ...item, quantity: item.quantity + 1 }
//           : item
//       );
//       setCart(updatedCart);
//     } else {
//       setCart([...cart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
//     }
//     updateBillingDetails(cart);
//   };

//   return (
//     <div className="billing-page">
//       <div className="billing-container">
//         <div className="left-panel">
//           <h3>Search Products</h3>
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search for products..."
//               value={searchTerm}
//               onChange={handleSearch}
//             />
//           </div>
//           <ul className="product-list">
//             {filteredProducts.map(product => (
//               <li key={product.id} onClick={() => handleAddToCart(product)}>
//                 {product.name} - Rs. {product.price.toFixed(2)}
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div className="right-panel">
//           <h3>Cart</h3>
//           <ul className="cart-list">
//             {cart.map(item => (
//               <li key={item.productId}>
//                 {item.name} - Rs. {item.price.toFixed(2)}
//                 <input
//                   type="number"
//                   min="1"
//                   value={item.quantity}
//                   onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
//                 />
//               </li>
//             ))}
//           </ul>
//           <div className="customer-name">
//             <label>Customer Name:</label>
//             <input
//               type="text"
//               value={customerName}
//               onChange={(e) => setCustomerName(e.target.value)}
//             />
//           </div>
//           <div className="customer-name">
//             <label>Customer State:</label>
//             <input
//               type="text"
//               value={customerState}
//               onChange={(e) => setCustomerState(e.target.value)}
//             />
//           </div>
//           <div className="discount-input">
//             <label>Discount Percentage:</label>
//             <input
//               type="number"
//               value={billingDetails.discountPercentage}
//               onChange={handleDiscountChange}
//             />
//           </div>
//           <div className="billing-summary">
//             <h3>Billing Summary</h3>
//             <p>Total Amount: Rs. {billingDetails.totalAmount.toFixed(2)}</p>
//             <p>Discounted Total: Rs. {billingDetails.discountedTotal.toFixed(2)}</p>
//             <p>CGST (9%): Rs. {billingDetails.cgstAmount.toFixed(2)}</p>
//             <p>SGST (9%): Rs. {billingDetails.sgstAmount.toFixed(2)}</p>
//             <p>IGST (18%): Rs. {billingDetails.igstAmount.toFixed(2)}</p>
//             <h3>Grand Total: Rs. {billingDetails.grandTotal.toFixed(2)}</h3>
//           </div>
//           <button className="save-button" onClick={handleSave}>Save & Generate PDF</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillingCalculator;
// import React, { useState, useEffect } from 'react';
// import { db } from '../firebase'; // Import the initialized firebase instance
// import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import './BillingCalculator.css'; // Import the CSS file

// const BillingCalculator = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [billingDetails, setBillingDetails] = useState({
//     totalAmount: 0,
//     discountPercentage: '',
//     discountedTotal: 0,
//     cgstAmount: 0,
//     sgstAmount: 0,
//     igstAmount: 0,
//     grandTotal: 0,
//   });
//   const [customerName, setCustomerName] = useState('');
//   const [customerState, setCustomerState] = useState(''); // New state for customer state
//   const [businessState, setBusinessState] = useState('YourBusinessState'); // State where the business is located
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const productsCollectionRef = collection(db, 'products');
//       try {
//         const querySnapshot = await getDocs(productsCollectionRef);
//         const fetchedProducts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setProducts(fetchedProducts);
//       } catch (error) {
//         console.error('Error fetching products: ', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleQuantityChange = (productId, quantity) => {
//     const updatedCart = cart.map(item =>
//       item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
//     );
//     setCart(updatedCart);
//     updateBillingDetails(updatedCart);
//   };

//   const updateBillingDetails = (updatedCart) => {
//     const totalAmount = updatedCart.reduce((total, item) => {
//       return total + (item.price * item.quantity);
//     }, 0);

//     const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
//     const discountedTotal = totalAmount * (1 - discountPercentage / 100);

//     let cgstAmount = 0;
//     let sgstAmount = 0;
//     let igstAmount = 0;
//     if (customerState === businessState) {
//       cgstAmount = discountedTotal * 0.09;
//       sgstAmount = discountedTotal * 0.09;
//     } else {
//       igstAmount = discountedTotal * 0.18;
//     }

//     const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

//     setBillingDetails(prevState => ({
//       ...prevState,
//       totalAmount,
//       discountedTotal,
//       cgstAmount,
//       sgstAmount,
//       igstAmount,
//       grandTotal,
//     }));
//   };

//   const handleDiscountChange = (event) => {
//     const discountPercentage = event.target.value;
//     setBillingDetails(prevState => ({
//       ...prevState,
//       discountPercentage,
//     }));
//   };

//   useEffect(() => {
//     updateBillingDetails(cart);
//   }, [billingDetails.discountPercentage, customerState]);

//   const handleSave = async () => {
//     const billingDocRef = collection(db, 'billing');
//     try {
//       await addDoc(billingDocRef, { 
//         ...billingDetails, 
//         customerName,
//         customerState,
//         date: Timestamp.fromDate(new Date()) // Add the current date
//       });
    
//       console.log('Billing details saved successfully in Firestore');
//     } catch (error) {
//       console.error('Error saving billing details: ', error);
//     }
//     window.location.reload();
//     const doc = new jsPDF();
  
//     //  doc.addImage(imgData, 'JPEG', 10, 10, 30, 30);
//     doc.setFontSize(14);
//     doc.text('Tamizha Software solutions', 40, 20); // Adjust position based on logo size
//     doc.setFontSize(10);
//     doc.text('Thiruthangal', 40, 28);
//     doc.text('Contact: 123-456-7890', 40, 35);

//     // Add Date
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 20);

//     // Add Customer Name
//     doc.text(`Customer Name: ${customerName}`, 150, 28);

//     // Prepare Table Body
//     const tableBody = cart
//       .filter(item => item.quantity > 0)
//       .map(item => [
//         item.name,
//         item.quantity.toString(),
//         `Rs. ${item.price.toFixed(2)}`,
//         `Rs. ${(item.price * item.quantity).toFixed(2)}`
//       ]);

//     // Add Summary Rows
//     tableBody.push(
//       [
//         { content: 'Total Amount:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.totalAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Discounted Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.discountedTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'CGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.cgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'SGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.sgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'IGST (18%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.igstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Grand Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.grandTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } }
//       ]
//     );

//     // Add Table
//     doc.autoTable({
//       startY: 50, // Adjust starting Y position to leave space for logo and header
//       head: [['Item', 'Quantity', 'Price', 'Total']],
//       body: tableBody,
//       styles: {
//         lineColor: [0, 0, 0],
//         lineWidth: 0.1,
//         font: "helvetica",
//         fontSize: 10,
//         cellPadding: 3,
//         textColor: [0, 0, 0],
//       },
//       headStyles: {
//         fillColor: [200, 200, 200],
//         textColor: [0, 0, 0],
//         fontStyle: 'bold',
//         lineWidth: 0.5,
//         lineColor: [0, 0, 0]
//       },
//       theme: 'plain',
//       didDrawPage: (data) => {
//         // Add logo/image here if needed
//         doc.setFontSize(10);
//         doc.text('Thank you for your business!', 40, doc.internal.pageSize.height - 20); // Adjust position based on content size
//       }
//     });

//     doc.save(`invoice_${customerName}_${new Date().getTime()}.pdf`);
//   };

//   const handleSearch = (event) => {
//     const searchTerm = event.target.value.toLowerCase();
//     setSearchTerm(searchTerm);
//     if (searchTerm.trim() !== '') {
//       const filteredProducts = products.filter(product =>
//         product.name.toLowerCase().includes(searchTerm)
//       );
//       setFilteredProducts(filteredProducts);
//     } else {
//       setFilteredProducts([]);
//     }
//   };

//   const handleAddToCart = (product) => {
//     const existingItem = cart.find(item => item.productId === product.id);
//     if (existingItem) {
//       const updatedCart = cart.map(item =>
//         item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
//       );
//       setCart(updatedCart);
//     } else {
//       const newCartItem = {
//         productId: product.id,
//         name: product.name,
//         price: product.price,
//         quantity: 1,
//       };
//       setCart([...cart, newCartItem]);
//     }
//     updateBillingDetails([...cart, { ...product, quantity: 1 }]);
//   };

//   return (
//     <div className="billing-page">
//       <div className="billing-container">
//         <div className="left-panel">
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search items..."
//               value={searchTerm}
//               onChange={handleSearch}
//             />
//           </div>
//           <ul className={`product-list ${searchTerm !== '' ? '' : 'hidden'}`}>
//             {searchTerm !== '' ? (
//               filteredProducts.map(product => (
//                 <li key={product.id} onClick={() => handleAddToCart(product)}>
//                   {product.name} - Rs. {product.price.toFixed(2)}
//                 </li>
//               ))
//             ) : (
//               products.map(product => (
//                 <li key={product.id} onClick={() => handleAddToCart(product)}>
//                   {product.name} - Rs. {product.price.toFixed(2)}
//                 </li>
//               ))
//             )}
//           </ul>
//         </div>
//         <div className="right-panel">
//           {/* Display the cart items and billing details here */}
//           <h2>Cart</h2>
//           <ul className="cart-list">
//             {cart.map(item => (
//               <li key={item.productId}>
//                 {item.name} - Qty: <input
//                   type="number"
//                   value={item.quantity}
//                   onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
//                 />
//               </li>
//             ))}
//           </ul>
//           <div className="billing-summary">
//             <h3>Billing Summary</h3>
//             <p>Total Amount: Rs. {billingDetails.totalAmount.toFixed(2)}</p>
//             <p>Discount Percentage:
//               <input
//                 type="number"
//                 value={billingDetails.discountPercentage}
//                 onChange={handleDiscountChange}
//               />
//             </p>
//             <p>Discounted Total: Rs. {billingDetails.discountedTotal.toFixed(2)}</p>
//             <p>CGST (9%): Rs. {billingDetails.cgstAmount.toFixed(2)}</p>
//             <p>SGST (9%): Rs. {billingDetails.sgstAmount.toFixed(2)}</p>
//             <p>IGST (18%): Rs. {billingDetails.igstAmount.toFixed(2)}</p>
//             <p>Grand Total: Rs. {billingDetails.grandTotal.toFixed(2)}</p>
//           </div>
//           <button className="save-button" onClick={handleSave}>Save Invoice</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillingCalculator;

// import React, { useState, useEffect } from 'react';
// import { db } from '../firebase'; // Import the initialized firebase instance
// import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import './BillingCalculator.css'; // Import the CSS file

// const BillingCalculator = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [billingDetails, setBillingDetails] = useState({
//     totalAmount: 0,
//     discountPercentage: '',
//     discountedTotal: 0,
//     cgstAmount: 0,
//     sgstAmount: 0,
//     igstAmount: 0,
//     grandTotal: 0,
//   });
//   const [customerName, setCustomerName] = useState('');
//   const [customerState, setCustomerState] = useState(''); // New state for customer state
//   const [businessState, setBusinessState] = useState('YourBusinessState'); // State where the business is located
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const productsCollectionRef = collection(db, 'products');
//       try {
//         const querySnapshot = await getDocs(productsCollectionRef);
//         const fetchedProducts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setProducts(fetchedProducts);
//       } catch (error) {
//         console.error('Error fetching products: ', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleQuantityChange = (productId, quantity) => {
//     const updatedCart = cart.map(item =>
//       item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
//     );
//     setCart(updatedCart);
//     updateBillingDetails(updatedCart);
//   };

//   const updateBillingDetails = (updatedCart) => {
//     const totalAmount = updatedCart.reduce((total, item) => {
//       return total + (item.price * item.quantity);
//     }, 0);

//     const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
//     const discountedTotal = totalAmount * (1 - discountPercentage / 100);

//     let cgstAmount = 0;
//     let sgstAmount = 0;
//     let igstAmount = 0;
//     if (customerState === businessState) {
      
//     } else {
//       cgstAmount = discountedTotal * 0.09;
//       sgstAmount = discountedTotal * 0.09;
//       igstAmount = discountedTotal * 0.18;
//     }

//     const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

//     setBillingDetails(prevState => ({
//       ...prevState,
//       totalAmount,
//       discountedTotal,
//       cgstAmount,
//       sgstAmount,
//       igstAmount,
//       grandTotal,
//     }));
//   };

//   const handleDiscountChange = (event) => {
//     const discountPercentage = event.target.value;
//     setBillingDetails(prevState => ({
//       ...prevState,
//       discountPercentage,
//     }));
//   };

//   useEffect(() => {
//     updateBillingDetails(cart);
//   }, [billingDetails.discountPercentage, customerState]);

//   const handleSave = async () => {
//     const billingDocRef = collection(db, 'billing');
//     try {
//       await addDoc(billingDocRef, { 
//         ...billingDetails, 
//         customerName,
//         customerState,
//         date: Timestamp.fromDate(new Date()) // Add the current date
//       });
//       console.log('Billing details saved successfully in Firestore');
//     } catch (error) {
//       console.error('Error saving billing details: ', error);
//     }

//     const doc = new jsPDF();

//     // doc.addImage(imgData, 'JPEG', 10, 10, 30, 30);
//     doc.setFontSize(14);
//     doc.text('Tamizha Software solutions', 40, 20); // Adjust position based on logo size
//     doc.setFontSize(10);
//     doc.text('Thiruthangal', 40, 28);
//     doc.text('Contact: 123-456-7890', 40, 35);

//     // Add Date
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 20);

//     // Add Customer Name and Customer State in a single line
//     doc.text(`Customer Name: ${customerName}     Customer State: ${customerState}`, 150, 28);

//     // Prepare Table Body
//     const tableBody = cart
//       .filter(item => item.quantity > 0)
//       .map(item => [
//         item.name,
//         item.quantity.toString(),
//         `Rs. ${item.price.toFixed(2)}`,
//         `Rs. ${(item.price * item.quantity).toFixed(2)}`
//       ]);

//     // Add Summary Rows
//     tableBody.push(
//       [
//         { content: 'Total Amount:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.totalAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Discounted Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.discountedTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'CGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.cgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'SGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.sgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'IGST (18%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.igstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Grand Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.grandTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } }
//       ]
//     );
//     doc.autoTable({
//             startY: 50, // Adjust starting Y position to leave space for logo and header
//             head: [['Item', 'Quantity', 'Price', 'Total']],
//             body: tableBody,
//             styles: {
//               lineColor: [0, 0, 0],
//               lineWidth: 0.1,
//               font: "helvetica",
//               fontSize: 10,
//               cellPadding: 3,
//               textColor: [0, 0, 0],
//             },
//             headStyles: {
//               fillColor: [200, 200, 200],
//               textColor: [0, 0, 0],
//               fontStyle: 'bold',
//               lineWidth: 0.5,
//               lineColor: [0, 0, 0]
//             },
//             theme: 'plain',
//             didDrawPage: (data) => {
//               // Add logo/image here if needed
//               doc.setFontSize(10);
//               doc.text('Thank you for your business!', 40, doc.internal.pageSize.height - 20); // Adjust position based on content size
//             }
//           });
      
//     // Add Table
   

//     // Add Footer
//     const finalY = doc.lastAutoTable.finalY || 10;
//     doc.setFontSize(10);
//     doc.text('Thank you for your business!', 10, finalY + 10);
//     doc.text('Please contact us if you have any questions about this invoice.', 10, finalY + 20);

//     doc.save('billing_details.pdf');
//   };

//   const handleSearchChange = (event) => {
//     const searchTerm = event.target.value.toLowerCase();
//     setSearchTerm(searchTerm);
//     const filtered = products.filter(product => product.name.toLowerCase().includes(searchTerm));
//     setFilteredProducts(filtered);
//   };

//   const handleAddToCart = (product) => {
//     const productInCart = cart.find(item => item.productId === product.id);
//     if (!productInCart) {
//       setCart(prevCart => [...prevCart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
//     } else {
//       const updatedCart = cart.map(item =>
//         item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
//       );
//       setCart(updatedCart);
//     }
//     updateBillingDetails(cart);
//   };

//   return (
//     <div className="billing-page">
//       <div className="billing-container">
//         <div className="left-panel">
//           <h2>Billing Calculator</h2>
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search products..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//             />
//           </div>
//           <ul className="product-list">
//             {searchTerm && filteredProducts.map(product => (
//               <li key={product.id} onClick={() => handleAddToCart(product)}>
//                 {product.name} - ₹{product.price.toFixed(2)}
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div className="right-panel">
//           <div className="customer-details">
//             <div className="customer-input">
//               <label>Customer Name:</label>
//               <input
//                 type="text"
//                 value={customerName}
//                 onChange={(e) => setCustomerName(e.target.value)}
//               />
//             </div>
//             <div className="customer-input">
//               <label>Customer State:</label>
//               <input
//                 type="text"
//                 value={customerState}
//                 onChange={(e) => setCustomerState(e.target.value)}
//               />
//             </div>
//           </div>
//           <ul className="cart-list">
//             {cart.map(item => (
//               <li key={item.productId}>
//                 {item.name} - ₹{item.price.toFixed(2)} x 
//                 <input
//                   type="number"
//                   min="1"
//                   value={item.quantity}
//                   onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
//                 />
//                 = ₹{(item.price * item.quantity).toFixed(2)}
//               </li>
//             ))}
//           </ul>
//           <div className="billing-details">
//             <label>Discount Percentage:</label>
//             <input
//               type="number"
//               min="0"
//               max="100"
//               value={billingDetails.discountPercentage}
//               onChange={handleDiscountChange}
//             />
//             %
//           </div>
//           <div className="billing-summary">
//             <h3>Total Amount: ₹{billingDetails.totalAmount.toFixed(2)}</h3>
//             <p>Discounted Total: ₹{billingDetails.discountedTotal.toFixed(2)}</p>
//             <p>CGST (9%): ₹{billingDetails.cgstAmount.toFixed(2)}</p>
//             <p>SGST (9%): ₹{billingDetails.sgstAmount.toFixed(2)}</p>
//             <p>IGST (18%): ₹{billingDetails.igstAmount.toFixed(2)}</p>
//             <h3>Grand Total: ₹{billingDetails.grandTotal.toFixed(2)}</h3>
//           </div>
//           <button className="save-button" onClick={handleSave}>Save and Generate PDF</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillingCalculator;

// import React, { useState, useEffect } from 'react';
// import { db } from '../firebase'; // Import the initialized firebase instance
// import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import './BillingCalculator.css'; // Import the CSS file

// const BillingCalculator = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [billingDetails, setBillingDetails] = useState({
//     totalAmount: 0,
//     discountPercentage: '',
//     discountedTotal: 0,
//     cgstAmount: 0,
//     sgstAmount: 0,
//     igstAmount: 0,
//     grandTotal: 0,
//   });
//   const [customerName, setCustomerName] = useState('');
//   const [customerState, setCustomerState] = useState(''); // New state for customer state
//   const [businessState, setBusinessState] = useState('YourBusinessState'); // State where the business is located
//   const [searchTerm, setSearchTerm] = useState('');
//   const [taxOption, setTaxOption] = useState('cgst_sgst'); // Default tax option

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const productsCollectionRef = collection(db, 'products');
//       try {
//         const querySnapshot = await getDocs(productsCollectionRef);
//         const fetchedProducts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setProducts(fetchedProducts);
//       } catch (error) {
//         console.error('Error fetching products: ', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleQuantityChange = (productId, quantity) => {
//     const updatedCart = cart.map(item =>
//       item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
//     );
//     setCart(updatedCart);
//     updateBillingDetails(updatedCart);
//   };

//   const updateBillingDetails = (updatedCart) => {
//     const totalAmount = updatedCart.reduce((total, item) => {
//       return total + (item.price * item.quantity);
//     }, 0);

//     const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
//     const discountedTotal = totalAmount * (1 - discountPercentage / 100);

//     let cgstAmount = 0;
//     let sgstAmount = 0;
//     let igstAmount = 0;

//     if (taxOption === 'cgst_sgst') {
//       if (customerState === businessState) {
        
//       } else {
//         cgstAmount = discountedTotal * 0.09;
//         sgstAmount = discountedTotal * 0.09;
//         // igstAmount = discountedTotal * 0.18;
//       }
//     } else if (taxOption === 'igst') {
//       igstAmount = discountedTotal * 0.18;
//     }

//     const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

//     setBillingDetails(prevState => ({
//       ...prevState,
//       totalAmount,
//       discountedTotal,
//       cgstAmount,
//       sgstAmount,
//       igstAmount,
//       grandTotal,
//     }));
//   };

//   const handleDiscountChange = (event) => {
//     const discountPercentage = event.target.value;
//     setBillingDetails(prevState => ({
//       ...prevState,
//       discountPercentage,
//     }));
//   };

//   useEffect(() => {
//     updateBillingDetails(cart);
//   }, [billingDetails.discountPercentage, customerState, taxOption]);

//   const handleSave = async () => {
//     const billingDocRef = collection(db, 'billing');
//     try {
//       await addDoc(billingDocRef, {
//         ...billingDetails,
//         customerName,
//         customerState,
//         date: Timestamp.fromDate(new Date()) // Add the current date
//       });
//       console.log('Billing details saved successfully in Firestore');
//     } catch (error) {
//       console.error('Error saving billing details: ', error);
//     }
//     window.location.reload();
//     const doc = new jsPDF();
//     const imgData=
//     doc.addImage(imgData, 'JPEG', 10, 10, 30, 30);
//     doc.setFontSize(14);
//     doc.text('Tamizha Software solutions', 40, 20); // Adjust position based on logo size
//     doc.setFontSize(10);
//     doc.text('Thiruthangal', 40, 28);
//     doc.text('Contact: 123-456-7890', 40, 35);

//     // Add Date
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 20);

//     // Add Customer Name and Customer State in a single line
//     doc.text(`Customer Name: ${customerName}`,150,24);     
//     doc.text(`Customer State: ${customerState}`, 150, 28);

//     // Prepare Table Body
//     const tableBody = cart
//       .filter(item => item.quantity > 0)
//       .map(item => [
//         item.name,
//         item.quantity.toString(),
//         `Rs. ${item.price.toFixed(2)}`,
//         `Rs. ${(item.price * item.quantity).toFixed(2)}`
//       ]);

//     // Add Summary Rows
//     tableBody.push(
//       [
//         { content: 'Total Amount:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.totalAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Discounted Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.discountedTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//     );

//     if (taxOption === 'cgst_sgst') {
//       tableBody.push(
//         [
//           { content: 'CGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//           { content: `Rs. ${billingDetails.cgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//         ],
//         [
//           { content: 'SGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//           { content: `Rs. ${billingDetails.sgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//         ]
//       );
//     } else if (taxOption === 'igst') {
//       tableBody.push(
//         [
//           { content: 'IGST (18%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//           { content: `Rs. ${billingDetails.igstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//         ]
//       );
//     }

//     tableBody.push(
//       [
//         { content: 'Grand Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.grandTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } }
//       ]
//     );

//     doc.autoTable({
//       startY: 50, // Adjust starting Y position to leave space for logo and header
//       head: [['Item', 'Quantity', 'Price', 'Total']],
//       body: tableBody,
//       styles: {
//         lineColor: [0, 0, 0],
//         lineWidth: 0.1,
//         font: "helvetica",
//         fontSize: 10,
//         cellPadding: 3,
//         textColor: [0, 0, 0],
//       },
//       headStyles: {
//         fillColor: [200, 200, 200],
//         textColor: [0, 0, 0],
//         fontStyle: 'bold',
//         lineWidth: 0.5,
//         lineColor: [0, 0, 0]
//       },
//       theme: 'plain',
//       didDrawPage: (data) => {
//         // Add logo/image here if needed
//         doc.setFontSize(10);
//         doc.text('Thank you for your business!', 40, doc.internal.pageSize.height - 20); // Adjust position based on content size
//       }
//     });

//     // Add Footer
//     const finalY = doc.lastAutoTable.finalY || 10;
//     doc.setFontSize(10);
//     doc.text('Thank you for your business!', 10, finalY + 10);
//     doc.text('Please contact us if you have any questions about this invoice.', 10, finalY + 20);

//     doc.save('billing_details.pdf');
//   };

//   const handleSearchChange = (event) => {
//     const searchTerm = event.target.value.toLowerCase();
//     setSearchTerm(searchTerm);
//     const filtered = products.filter(product => product.name.toLowerCase().includes(searchTerm));
//     setFilteredProducts(filtered);
//   };

//   const handleAddToCart = (product) => {
//     const productInCart = cart.find(item => item.productId === product.id);
//     if (!productInCart) {
//       setCart(prevCart => [...prevCart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
//     } else {
//       const updatedCart = cart.map(item =>
//         item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
//       );
//       setCart(updatedCart);
//     }
//     updateBillingDetails(cart);
//   };

//   const handleTaxOptionChange = (event) => {
//     setTaxOption(event.target.value);
//   };

//   return (
//     <div className="billing-page">
//       <div className="billing-container">
//         <div className="left-panel">
//           <h2>Billing Calculator</h2>
//           <div className="search-bar">
//             <input
//             className="search-input"
//               type="text"
//               placeholder="Search products..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//             />
//           </div>
//           <ul className="product-list">
//             {searchTerm && filteredProducts.map(product => (
//               <li key={product.id} onClick={() => handleAddToCart(product)}>
//                 {product.name} - ₹{product.price.toFixed(2)}
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div className="right-panel">
//           <div className="customer-details">
//             <div className="customer-input">
//               <label>Customer Name:</label>
//               <input
//                 type="text"
//                 value={customerName}
//                 onChange={(e) => setCustomerName(e.target.value)}
//                 required 
//               />
//             </div>
//             <div className="customer-input">
//               <label>Customer State:</label>
//               <input
//                 type="text"
//                 value={customerState}
//                 onChange={(e) => setCustomerState(e.target.value)}
//               />
//             </div>
//             <div className="tax-options">
//               <input
//                 type="radio"
//                 id="cgst_sgst"
//                 name="taxOption"
//                 value="cgst_sgst"
//                 checked={taxOption === 'cgst_sgst'}
//                 onChange={handleTaxOptionChange}
//               />
//               <label htmlFor="cgst_sgst">CGST + SGST (9% each)</label>
//               <br />
//               <input
//                 type="radio"
//                 id="igst"
//                 name="taxOption"
//                 value="igst"
//                 checked={taxOption === 'igst'}
//                 onChange={handleTaxOptionChange}
//               />
//               <label htmlFor="igst">IGST (18%)</label>
//             </div>
//           </div>
//           <ul className="cart-list">
//             {cart.map(item => (
//               <li key={item.productId}>
//                 {item.name} - ₹{item.price.toFixed(2)} x
//                 <input
//                   type="number"
//                   min="1"
//                   value={item.quantity}
//                   onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
//                 />
//                 = ₹{(item.price * item.quantity).toFixed(2)}
//               </li>
//             ))}
//           </ul>
//           <div className="billing-details">
//             <label>Discount Percentage:</label>
//             <input
//               type="number"
//               min="0"
//               max="100"
//               value={billingDetails.discountPercentage}
//               onChange={handleDiscountChange}
//             />
//             %
//           </div>
//           <div className="billing-summary">
//             <h3>Total Amount: ₹{billingDetails.totalAmount.toFixed(2)}</h3>
//             <p>Discounted Total: ₹{billingDetails.discountedTotal.toFixed(2)}</p>
//             {taxOption === 'cgst_sgst' && (
//               <>
//                 <p>CGST (9%): ₹{billingDetails.cgstAmount.toFixed(2)}</p>
//                 <p>SGST (9%): ₹{billingDetails.sgstAmount.toFixed(2)}</p>
//               </>
//             )}
//             {taxOption === 'igst' && (
//               <p>IGST (18%): ₹{billingDetails.igstAmount.toFixed(2)}</p>
//             )}
//             <h3>Grand Total: ₹{billingDetails.grandTotal.toFixed(2)}</h3>
//           </div>
//           <button className="save-button" onClick={handleSave}>Save and Generate PDF</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillingCalculator;


// import React, { useState, useEffect } from 'react';
// import { db } from '../firebase'; // Import the initialized firebase instance
// import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import './BillingCalculator.css'; // Import the CSS file

// const BillingCalculator = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [billingDetails, setBillingDetails] = useState({
//     totalAmount: 0,
//     discountPercentage: '',
//     discountedTotal: 0,
//     cgstAmount: 0,
//     sgstAmount: 0,
//     igstAmount: 0,
//     grandTotal: 0,
//   });
//   const [customerName, setCustomerName] = useState('');
//   const [customerState, setCustomerState] = useState(''); // New state for customer state
//   const [businessState, setBusinessState] = useState('YourBusinessState'); // State where the business is located
//   const [searchTerm, setSearchTerm] = useState('');
//   const [taxOption, setTaxOption] = useState('cgst_sgst'); // Default tax option

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const productsCollectionRef = collection(db, 'products');
//       try {
//         const querySnapshot = await getDocs(productsCollectionRef);
//         const fetchedProducts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setProducts(fetchedProducts);
//       } catch (error) {
//         console.error('Error fetching products: ', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleQuantityChange = (productId, quantity) => {
//     const updatedCart = cart.map(item =>
//       item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
//     );
//     setCart(updatedCart);
//     updateBillingDetails(updatedCart);
//   };

//   const updateBillingDetails = (updatedCart) => {
//     const totalAmount = updatedCart.reduce((total, item) => {
//       return total + (item.price * item.quantity);
//     }, 0);

//     const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
//     const discountedTotal = totalAmount * (1 - discountPercentage / 100);

//     let cgstAmount = 0;
//     let sgstAmount = 0;
//     let igstAmount = 0;

//     if (taxOption === 'cgst_sgst') {
//       if (customerState === businessState) {
        
//       } else {
//         cgstAmount = discountedTotal * 0.09;
//         sgstAmount = discountedTotal * 0.09;
//         // igstAmount = discountedTotal * 0.18;
//       }
//     } else if (taxOption === 'igst') {
//       igstAmount = discountedTotal * 0.18;
//     }

//     const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

//     setBillingDetails(prevState => ({
//       ...prevState,
//       totalAmount,
//       discountedTotal,
//       cgstAmount,
//       sgstAmount,
//       igstAmount,
//       grandTotal,
//     }));
//   };

//   const handleDiscountChange = (event) => {
//     const discountPercentage = event.target.value;
//     setBillingDetails(prevState => ({
//       ...prevState,
//       discountPercentage,
//     }));
//   };

//   useEffect(() => {
//     updateBillingDetails(cart);
//   }, [billingDetails.discountPercentage, customerState, taxOption]);

//   const handleSave = async () => {
//     const billingDocRef = collection(db, 'billing');
//     try {
//       await addDoc(billingDocRef, {
//         ...billingDetails,
//         customerName,
//         customerState,
//         date: Timestamp.fromDate(new Date()) // Add the current date
//       });
//       console.log('Billing details saved successfully in Firestore');
//     } catch (error) {
//       console.error('Error saving billing details: ', error);
//     }
//     window.location.reload();
//     const doc = new jsPDF();

//     // doc.addImage(imgData, 'JPEG', 10, 10, 30, 30);
//     doc.setFontSize(14);
//     doc.text('Tamizha Software solutions', 40, 20); // Adjust position based on logo size
//     doc.setFontSize(10);
//     doc.text('Thiruthangal', 40, 28);
//     doc.text('Contact: 123-456-7890', 40, 35);

//     // Add Date
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 20);

//     // Add Customer Name and Customer State in a single line
//     doc.text(`Customer Name: ${customerName}     Customer State: ${customerState}`, 150, 28);

//     // Prepare Table Body
//     const tableBody = cart
//       .filter(item => item.quantity > 0)
//       .map(item => [
//         item.name,
//         item.quantity.toString(),
//         `Rs. ${item.price.toFixed(2)}`,
//         `Rs. ${(item.price * item.quantity).toFixed(2)}`
//       ]);

//     // Add Summary Rows
//     tableBody.push(
//       [
//         { content: 'Total Amount:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.totalAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Discounted Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.discountedTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//     );

//     if (taxOption === 'cgst_sgst') {
//       tableBody.push(
//         [
//           { content: 'CGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//           { content: `Rs. ${billingDetails.cgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//         ],
//         [
//           { content: 'SGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//           { content: `Rs. ${billingDetails.sgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//         ]
//       );
//     } else if (taxOption === 'igst') {
//       tableBody.push(
//         [
//           { content: 'IGST (18%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//           { content: `Rs. ${billingDetails.igstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//         ]
//       );
//     }

//     tableBody.push(
//       [
//         { content: 'Grand Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.grandTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } }
//       ]
//     );

//     doc.autoTable({
//       startY: 50, // Adjust starting Y position to leave space for logo and header
//       head: [['Product Name', 'Quantity', 'Price', 'Total']],
//       body: tableBody,
//       theme: 'grid',
//       styles: {
//         halign: 'center',
//         valign: 'middle',
//         fontStyle: 'normal',
//         fontSize: 10,
//         cellPadding: 4,
//         overflow: 'linebreak'
//       },
//       columnStyles: {
//         0: { cellWidth: 60 },
//         1: { cellWidth: 40 },
//         2: { cellWidth: 40 },
//         3: { cellWidth: 50 }
//       },
//       margin: { top: 10, right: 10, bottom: 10, left: 10 }
//     });

//     doc.save('billing_invoice.pdf');
//   };

//   const handleSearch = (event) => {
//     setSearchTerm(event.target.value);
//     const filteredProducts = products.filter(product =>
//       product.name.toLowerCase().includes(event.target.value.toLowerCase())
//     );
//     setFilteredProducts(filteredProducts);
//   };

//   const handleAddToCart = (product) => {
//     const cartItem = cart.find(item => item.productId === product.id);
//     if (cartItem) {
//       const updatedCart = cart.map(item =>
//         item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
//       );
//       setCart(updatedCart);
//     } else {
//       const newCartItem = {
//         productId: product.id,
//         name: product.name,
//         price: product.price,
//         quantity: 1,
//       };
//       setCart([...cart, newCartItem]);
//     }
//     updateBillingDetails([...cart, { ...product, quantity: 1 }]);
//   };

//   return (
//     <div className="billing-calculator">
//       <div className="product-list">
//         <input
//           type="text"
//           placeholder="Search Products"
//           value={searchTerm}
//           onChange={handleSearch}
//           className="search-input"
//         />
//         <ul>
//           {filteredProducts.map(product => (
//             <li key={product.id}>
//               <div className="product-details">
//                 <span>{product.name}</span>
//                 <span>Rs. {product.price.toFixed(2)}</span>
//               </div>
//               <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
//             </li>
//           ))}
//         </ul>
//       </div>
//       <div className="cart">
//         <h2>Cart</h2>
//         <ul>
//           {cart.map(item => (
//             <li key={item.productId}>
//               <div className="cart-item">
//                 <span>{item.name}</span>
//                 <input
//                   type="number"
//                   value={item.quantity}
//                   onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
//                 />
//                 <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
//               </div>
//             </li>
//           ))}
//         </ul>
//         <div className="billing-summary">
//           <div className="billing-details">
//             <label>Discount (%)</label>
//             <input
//               type="number"
//               value={billingDetails.discountPercentage}
//               onChange={handleDiscountChange}
//               min="0"
//               max="100"
//             />
//             <label>Customer Name</label>
//             <input
//               type="text"
//               value={customerName}
//               onChange={(e) => setCustomerName(e.target.value)}
//             />
//             <label>Customer State</label>
//             <input
//               type="text"
//               value={customerState}
//               onChange={(e) => setCustomerState(e.target.value)}
//             />
//             <label>Tax Option</label>
//             <select value={taxOption} onChange={(e) => setTaxOption(e.target.value)}>
//               <option value="cgst_sgst">CGST + SGST</option>
//               <option value="igst">IGST</option>            
//               <option value="no_tax">No Tax</option>
//             </select>
//           </div>
//           <div className="billing-amounts">
//             <table>
//               <tbody>
//                 <tr>
//                   <td>Total Amount:</td>
//                   <td>Rs. {billingDetails.totalAmount.toFixed(2)}</td>
//                 </tr>
//                 <tr>
//                   <td>Discounted Total:</td>
//                   <td>Rs. {billingDetails.discountedTotal.toFixed(2)}</td>
//                 </tr>
//                 {taxOption === 'cgst_sgst' && (
//                   <>
//                     <tr>
//                       <td>CGST (9%):</td>
//                       <td>Rs. {billingDetails.cgstAmount.toFixed(2)}</td>
//                     </tr>
//                     <tr>
//                       <td>SGST (9%):</td>
//                       <td>Rs. {billingDetails.sgstAmount.toFixed(2)}</td>
//                     </tr>
//                   </>
//                 )}
//                 {taxOption === 'igst' && (
//                   <tr>
//                     <td>IGST (18%):</td>
//                     <td>Rs. {billingDetails.igstAmount.toFixed(2)}</td>
//                   </tr>
//                 )}
//                 <tr className="grand-total-row">
//                   <td>Grand Total:</td>
//                   <td>Rs. {billingDetails.grandTotal.toFixed(2)}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
//         <button onClick={handleSave}>Save</button>
//       </div>
//     </div>
//   );
// };

// export default BillingCalculator;

// import React, { useState, useEffect } from 'react';
// import { db } from '../firebase'; // Import the initialized firebase instance
// import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import './BillingCalculator.css'; // Import the CSS file

// const BillingCalculator = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [billingDetails, setBillingDetails] = useState({
//     totalAmount: 0,
//     discountPercentage: '',
//     discountedTotal: 0,
//     cgstAmount: 0,
//     sgstAmount: 0,
//     igstAmount: 0,
//     grandTotal: 0,
//   });
//   const [customerName, setCustomerName] = useState('');
//   const [customerState, setCustomerState] = useState('');
//   const [businessState, setBusinessState] = useState('YourBusinessState');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [taxOption, setTaxOption] = useState('cgst_sgst');
//   const [currentDate, setCurrentDate] = useState(new Date()); // State for current date

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const productsCollectionRef = collection(db, 'products');
//       try {
//         const querySnapshot = await getDocs(productsCollectionRef);
//         const fetchedProducts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setProducts(fetchedProducts);
//       } catch (error) {
//         console.error('Error fetching products: ', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleQuantityChange = (productId, quantity) => {
//     const updatedCart = cart.map(item =>
//       item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
//     );
//     setCart(updatedCart);
//     updateBillingDetails(updatedCart);
//   };

//   const updateBillingDetails = (updatedCart) => {
//     const totalAmount = updatedCart.reduce((total, item) => {
//       return total + (item.price * item.quantity);
//     }, 0);

//     const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
//     const discountedTotal = totalAmount * (1 - discountPercentage / 100);

//     let cgstAmount = 0;
//     let sgstAmount = 0;
//     let igstAmount = 0;

//     if (taxOption === 'cgst_sgst') {
//       if (customerState === businessState) {
        
//       } else {
//         cgstAmount = discountedTotal * 0.09;
//         sgstAmount = discountedTotal * 0.09;
//       }
//     } else if (taxOption === 'igst') {
//       igstAmount = discountedTotal * 0.18;
//     }

//     const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

//     setBillingDetails(prevState => ({
//       ...prevState,
//       totalAmount,
//       discountedTotal,
//       cgstAmount,
//       sgstAmount,
//       igstAmount,
//       grandTotal,
//     }));
//   };

//   const handleDiscountChange = (event) => {
//     const discountPercentage = event.target.value;
//     setBillingDetails(prevState => ({
//       ...prevState,
//       discountPercentage,
//     }));
//   };

//   useEffect(() => {
//     updateBillingDetails(cart);
//   }, [billingDetails.discountPercentage, customerState, taxOption]);

//   const handleSave = async () =>  {
//     const billingDocRef = collection(db, 'billing');
//     try {
//       await addDoc(billingDocRef, {
//         ...billingDetails,
//         customerName,
//         customerState,
//         date: Timestamp.fromDate(currentDate) // Use the selected date
//       });
//       console.log('Billing details saved successfully in Firestore');
//     } catch (error) {
//       console.error('Error saving billing details: ', error);
//     }
//     window.location.reload();
//     const doc = new jsPDF();

//     doc.setFontSize(14);
//     doc.text('Tamizha Software solutions', 40, 20);
//     doc.setFontSize(10);
//     doc.text('Thiruthangal', 40, 28);
//     doc.text('Contact: 123-456-7890', 40, 35);

//     // Add Date
//     doc.text(`Date: ${currentDate.toLocaleDateString()}`, 150, 20);

//     // Add Customer Name and Customer State
//     doc.text(`Customer Name: ${customerName}`,150,28  );  
//     doc.text( `Customer State: ${customerState}`, 150, 38);

//     // Prepare Table Body
//     const tableBody = cart
//       .filter(item => item.quantity > 0)
//       .map(item => [
//         item.name,
//         item.quantity.toString(),
//         `Rs. ${item.price.toFixed(2)}`,
//         `Rs. ${(item.price * item.quantity).toFixed(2)}`
//       ]);

//     // Add Summary Rows
//     tableBody.push(
//       [
//         { content: 'Total Amount:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.totalAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//       [
//         { content: 'Discounted Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.discountedTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//       ],
//     );

//     if (taxOption === 'cgst_sgst') {
//       tableBody.push(
//         [
//           { content: 'CGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//           { content: `Rs. ${billingDetails.cgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//         ],
//         [
//           { content: 'SGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//           { content: `Rs. ${billingDetails.sgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//         ]
//       );
//     } else if (taxOption === 'igst') {
//       tableBody.push(
//         [
//           { content: 'IGST (18%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
//           { content: `Rs. ${billingDetails.igstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
//         ]
//       );
//     }

//     tableBody.push(
//       [
//         { content: 'Grand Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } },
//         { content: `Rs. ${billingDetails.grandTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] } }
//       ]
//     );

//     doc.autoTable({
//       startY: 50, // Adjust starting Y position to leave space for logo and header
//       head: [['Product Name', 'Quantity', 'Price', 'Total']],
//       body: tableBody,
//       theme: 'grid',
//       styles: {
//         halign: 'center',
//         valign: 'middle',
//         fontStyle: 'normal',
//         fontSize: 10,
//         cellPadding: 4,
//         overflow: 'linebreak'
//       },
//       columnStyles: {
//         0: { cellWidth: 60 },
//         1: { cellWidth: 40 },
//         2: { cellWidth: 40 },
//         3: { cellWidth: 50 }
//       },
//       headStyles: {
//         fillColor: [211, 211, 211], // Light gray background for header
//         textColor: [0, 0, 0], // Black text color
//         fontStyle: 'bold', // Bold font style for header text
//         halign: 'center', // Center-aligned header text
//         lineWidth: 0.5, // Thin border for header
//         lineColor: [0, 0, 0] // Black border color
//       },
//       margin: { top: 10, right: 10, bottom: 10, left: 10 }
//     });

//     doc.save('billing_invoice.pdf');
//   };

//   const handleSearch = (event) => {
//     setSearchTerm(event.target.value);
//     const filteredProducts = products.filter(product =>
//       product.name.toLowerCase().includes(event.target.value.toLowerCase())
//     );
//     setFilteredProducts(filteredProducts);
//   };

//   const handleAddToCart = (product) => {
//     const cartItem = cart.find(item => item.productId === product.id);
//     if (cartItem) {
//       const updatedCart = cart.map(item =>
//         item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
//       );
//       setCart(updatedCart);
//     } else {
//       const newCartItem = {
//         productId: product.id,
//         name: product.name,
//         price: product.price,
//         quantity: 1,
//       };
//       setCart([...cart, newCartItem]);
//     }
//     updateBillingDetails([...cart, { ...product, quantity: 1 }]);
//   };

//   return (
//     <div className="billing-calculator">
//       <div className="product-list">
//         <input
//           type="text"
//           placeholder="Search Products"
//           value={searchTerm}
//           onChange={handleSearch}
//           className="search-input"
//         />
//         <ul>
//           {filteredProducts.map(product => (
//             <li key={product.id}>
//               <div className="product-details">
//                 <span>{product.name}</span>
//                 <span>Rs. {product.price.toFixed(2)}</span>
//               </div>
//               <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
//             </li>
//           ))}
//         </ul>
//       </div>
//       <div className="cart">
//         <h2>Cart</h2>
//         <ul>
//           {cart.map(item => (
//             <li key={item.productId}>
//               <div className="cart-item">
//                 <span>{item.name}</span>
//                 <input
//                   type="number"
//                   value={item.quantity}
//                   onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
//                 />
//                 <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
//               </div>
//             </li>
//           ))}
//         </ul>
//         <div className="billing-summary">
//           <div className="billing-details">
//             <label>Discount (%)</label>
//             <input
//               type="number"
//               value={billingDetails.discountPercentage}
//               onChange={handleDiscountChange}
//               min="0"
//               max="100"
//             />
//             <label>Customer Name</label>
//             <input
//               type="text"
//               value={customerName}
//               onChange={(e) => setCustomerName(e.target.value)}
//             />
//             <label>Customer State</label>
//             <input
//               type="text"
//               value={customerState}
//               onChange={(e) => setCustomerState(e.target.value)}
//             />
//             <label>Date</label>
//             <input
//               type="date"
//              className="custom-datepicker"
//               value={currentDate.toISOString().substr(0, 10)} // Display date in ISO format for input field
//               onChange={(e) => setCurrentDate(new Date(e.target.value))}
//             />
//             <label>Tax Option</label>
//             <select value={taxOption} onChange={(e) => setTaxOption(e.target.value)}>
//               <option value="cgst_sgst">CGST + SGST</option>
//               <option value="igst">IGST</option>            
//               <option value="no_tax">No Tax</option>
//             </select>
//           </div>
//           <div className="billing-amounts">
//             <table>
//               <tbody>
//                 <tr>
//                   <td>Total Amount:</td>
//                   <td>Rs. {billingDetails.totalAmount.toFixed(2)}</td>
//                 </tr>
//                 <tr>
//                   <td>Discounted Total:</td>
//                   <td>Rs. {billingDetails.discountedTotal.toFixed(2)}</td>
//                 </tr>
//                 {taxOption === 'cgst_sgst' && (
//                   <>
//                     <tr>
//                       <td>CGST (9%):</td>
//                       <td>Rs. {billingDetails.cgstAmount.toFixed(2)}</td>
//                     </tr>
//                     <tr>
//                       <td>SGST (9%):</td>
//                       <td>Rs. {billingDetails.sgstAmount.toFixed(2)}</td>
//                     </tr>
//                   </>
//                 )}
//                 {taxOption === 'igst' && (
//                   <tr>
//                     <td>IGST (18%):</td>
//                     <td>Rs. {billingDetails.igstAmount.toFixed(2)}</td>
//                   </tr>
//                 )}
//                 <tr className="grand-total-row">
//                   <td>Grand Total:</td>
//                   <td>Rs. {billingDetails.grandTotal.toFixed(2)}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
//         <button onClick={handleSave}>Save</button>
//       </div>
//     </div>
//   );
// };

// export default BillingCalculator;
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import the initialized firebase instance
import { collection, getDocs, addDoc, Timestamp, getDoc, doc as firestoreDoc, updateDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './BillingCalculator.css'; // Import the CSS file

const BillingCalculator = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [billingDetails, setBillingDetails] = useState({
    totalAmount: 0,
    discountPercentage: '',
    discountedTotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    grandTotal: 0,
  });
  const [customerName, setCustomerName] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerGSTIN, setCustomerSGSTIN] = useState('');
  const [customerPAN, setCustomerPAN] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [businessState, setBusinessState] = useState('YourBusinessState');
  const [searchTerm, setSearchTerm] = useState('');
  const [taxOption, setTaxOption] = useState('cgst_sgst');
  const [currentDate, setCurrentDate] = useState(new Date()); // State for current date
  const [showCustomerDetails, setShowCustomerDetails] = useState(false); // State for toggling customer details
  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollectionRef = collection(db, 'products');
      try {
        const querySnapshot = await getDocs(productsCollectionRef);
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    };

    fetchProducts();
  }, []);


  const handleQuantityChange = (productId, quantity) => {
        const updatedCart = cart.map(item =>
          item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
        );
        setCart(updatedCart);
        updateBillingDetails(updatedCart);
      };

  const updateBillingDetails = (updatedCart) => {
    const totalAmount = updatedCart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
    const discountedTotal = totalAmount * (1 - discountPercentage / 100);

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxOption === 'cgst_sgst') {
      if (customerState === businessState) {
        
      } else {
        cgstAmount = discountedTotal * 0.09;
        sgstAmount = discountedTotal * 0.09;
      }
    } else if (taxOption === 'igst') {
      igstAmount = discountedTotal * 0.18;
    }

    const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

    setBillingDetails(prevState => ({
      ...prevState,
      totalAmount,
      discountedTotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      grandTotal,
    }));
  };

  const handleDiscountChange = (event) => {
    const discountPercentage = event.target.value;
    setBillingDetails(prevState => ({
      ...prevState,
      discountPercentage,
    }));
  };
  useEffect(() => {
    updateBillingDetails(cart);
  }, [billingDetails.discountPercentage, customerState, taxOption]);

  const generateRandomInvoiceNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random 6-digit number
  };

  useEffect(() => {
    updateBillingDetails(cart);
  }, [billingDetails.discountPercentage, customerState, taxOption]);

  const handleSave = async () => {
   
  
    // Save billing details
    const invoiceNumber = generateRandomInvoiceNumber();
    const billingDocRef = collection(db, 'billing');
    try {
      await addDoc(billingDocRef, {
        ...billingDetails,
        customerName,
        customerAddress,
        customerState,
        customerPhone,
        customerEmail,
        customerGSTIN,
        date: Timestamp.fromDate(currentDate),
        productsDetails: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        createdAt: Timestamp.now(),
        invoiceNumber,
      });
      console.log('Billing details saved successfully in Firestore');
    } catch (error) {
      console.error('Error saving billing details: ', error);
    }
  window.location.reload();
    // Generate and save PDF invoice
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Draw border
    const imgData='data:image/png;base64,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HasZ4CdH34aot6BxywAWfBswVVdBbtBienYW3U0deOQDHzyiZzUTfCynT8WiXRPjE5/yrK1vq62rOf7EPY/f+fsxtW7dxX+1CIwsje97/c1jb1EsRbb3dr1YWe84q9JprggsI0xN3vzXE6fe2acz6Eso1dHRUVj1WsjSacwPX8L9e7djsKkSOqnUHFyHTshARxRB8gVQUiApCgLJIC+QJXKjBF8pshpECDlUlfUI5Qn85OU3oKlvQYJiUNRp8NinPjF18fqVDukAklvazRsjaHE04rZ9B5raiPrFf/99bmbmKxK5/L1nLp373qp7DRs+DyJhHw7u24l8Jgavex3xSBi7d+9GMp/H/PIKQokkOtp70NHSDZ1MO9db3/t4kUlMtKOdl6qN476lstNXLvhHJ8fQ1dOJXTu3f3zD673re//65L0f/fjH3iqvrn/6xz968jmH3YhDu7b99WsvvfjX18+fhYIr4MDWzbj/f7H33sFRnue78LW9V61W2tWq97LqDVAXIAECITo27j2OE8epP8dJHCd24sQtccEFm2IbjOldBaECEuq99963936+3UzOnDnzfd/8zn8nMu8MwzAD6H3u936euzzXfV1bc8AgWKBbmQWVYAODRvFwr9tcZNhABonK8kwV9U8rcPbabQRExCIyMQ3NA2OQhIdh+76yvQ1tjRcamu9i396yG1UV13dY1Dr8+Tevpy5NL28b7Oj7JdFJXHt+3+Oh68lP121AH1XMyRqa79URqGR7SmbyASaL5fru+oXuoZFB7CgrOdnQeP8xt+jIprSc7y+fv3jADbo4tHvPk0IG3frXN179pvP+HRzYuRlbc9PAorlAJ7vgctrBovOhUKhBIjGh0BjQ2j2Ixq5uqK1mpOTlYVmvhzg0GBtyCxRHv/jCqyB/C7YUbC6pulF5fXpsEk898dRhb4FvY2tL69Hme43b2RQmynbt2pgcFH3f027W9IWtqFZ+c6+j4SmlQQlff18srM7Dz18Gia8PLnx/DsrlVfhJpdhSUIS+7gHERCdgen4JNXfqERURiyNlB18KlQm/CCeEu/lv0LHat6u2re7K1OoC4tISYSc50djYiM2bN2Npfg1nj5/C42X70VpeianWFjy9axvSg/1gV82CRzAAFrWHI48MO8gUomd8z32n5wAFFKYQaybAxhKA7BOMm009uFjbgMjUjRAG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'

    doc.addImage(imgData, 'JPEG', 16, 24, 25, 25);

    // Set font size
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);  
    // Set font to bold and add the text
    doc.setFont('helvetica', 'bold');
    doc.text('STAR PYRO PARK', 44, 21);
    doc.setTextColor(0, 0, 0);
    // Reset font to normal
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    // Add the rest of the text
    doc.text('3/1320-8,SIVA NAGAR VISWANATHAM VILLAGE SIVAKASI', 44, 28);
    doc.setFontSize(9);
    doc.text('Phone no.: 8098892999', 44, 35);
    doc.text('Email: hariprakashtex@gmail.com', 44, 42);
    
    doc.text('State: 33-Tamil Nadu', 44, 49);
   
      doc.text(`Date: ${currentDate.toLocaleDateString()}`, 138, 22);
      doc.text(`Invoice Number:${invoiceNumber}`, 138, 31);
      doc.setFont('helvetica', 'bold');
      doc.text('GSTIN: 33AEGFS0424L1Z4', 138, 38);
    // Draw the rectangle
    doc.rect(14, 15, 182, 40);
    //Next rectangle
    doc.setFontSize(12);
    doc.setTextColor(170, 51, 106);  
    // Set font to bold and add the text
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO', 19, 74);
    doc.setTextColor(0, 0, 0);
    // Reset font to normal
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    // Add the rest of the text
    // doc.text(`Name: ${customerName}`, 23, 81);
    // doc.text(`Address: ${customerAddress}`, 23, 90);
    // doc.text(`State: ${customerState}`, 23,97);
    // doc.text(`Phone: ${customerPhone}`, 23, 104);
    // doc.text(`Email: ${customerEmail}`, 23, 111);
    // Define the starting coordinates and line height
const startX = 23;
let startY = 81;
const lineHeight = 8; // Adjust line height as needed

// Define the labels and values
const labels = [
  'Name',
  'Address',
  'State',
  'Phone',
  'GSTIN',
  'PAN'
  
];

const values = [
  customerName,
  customerAddress,
  customerState,
  customerPhone,
  customerGSTIN,
  customerPAN
  
];

// Calculate the maximum width of the labels without the colon
const maxLabelWidth = Math.max(...labels.map(label => doc.getTextWidth(label)));

// Define the colon offset
const colonOffset = 2; // Adjust the space between label and colon

// Add the text with proper alignment
labels.forEach((label, index) => {
  const labelText = label;
  const colonText = ':';
  const valueText = values[index];
  
  // Calculate positions
  const colonX = startX + maxLabelWidth + colonOffset;
  const valueX = colonX + doc.getTextWidth(colonText) + colonOffset;

  // Draw the text
  doc.text(labelText, startX, startY);
  doc.text(colonText, colonX, startY);
  doc.text(valueText, valueX, startY);
  
  // Move to the next line
  startY += lineHeight;
});

   
doc.setFontSize(12);
doc.setTextColor(170, 51, 106);  
// Set font to bold and add the text
doc.setFont('helvetica', 'bold');
doc.text('SHIPPED TO', 105, 74);
doc.setFont('helvetica', 'normal');
doc.setTextColor(0, 0, 0);
doc.setFontSize(10);

const initialX = 110;
let initialY = 81;
const lineSpacing = 8;  // Adjust line height as needed
const newColonOffset = 2; // Space between label and colon
const spacingBetweenLabelAndValue = 10; // Space between colon and value

// Define the labels and values
const labelTexts = [
  'Name',
  'Address',
  'State',
  'Phone',
  'GSTIN',
  'PAN'
];

const valuesTexts = [
  customerName,
  customerAddress,
  customerState,
  customerPhone,
  customerGSTIN,
  customerPAN,
];

// Calculate the maximum width of the labels without the colon
const maxLabelTextWidth = Math.max(...labelTexts.map(label => doc.getTextWidth(label)));

// Add the text with proper alignment
labelTexts.forEach((labelText, index) => {
  const valueText = valuesTexts[index];
  
  // Calculate positions
  const colonX = initialX + doc.getTextWidth(labelText) + newColonOffset;
  const valueX = colonX + doc.getTextWidth(':') + spacingBetweenLabelAndValue;

  // Draw the text
  doc.text(labelText, initialX, initialY);
  doc.text(':', colonX, initialY); // Draw the colon
  doc.text(valueText, valueX, initialY);
  
  // Move to the next line
  initialY += lineSpacing;
});

    // Draw the rectangle
    doc.rect(14, 67, 182, 70);
  
    // Prepare Table Body
    const tableBody = cart
      .filter(item => item.quantity > 0)
      .map(item => [
        item.name,
        item.quantity.toString(),
        `Rs. ${item.price.toFixed(2)}`,
        `Rs. ${(item.price * item.quantity).toFixed(2)}`
      ]);
  
    // Add Summary Rows
    tableBody.push(
      [
        { content: 'Total Amount:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
        { content: `Rs. ${billingDetails.totalAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
      ],
      [
        { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
        { content: `Rs. ${(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
      ],
      [
        { content: 'Discounted Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
        { content: `Rs. ${billingDetails.discountedTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
      ]
    );
  
    if (taxOption === 'cgst_sgst') {
      tableBody.push(
        [
          { content: 'CGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
          { content: `Rs. ${billingDetails.cgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
        ],
        [
          { content: 'SGST (9%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
          { content: `Rs. ${billingDetails.sgstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
        ]
      );
    } else if (taxOption === 'igst') {
      tableBody.push(
        [
          { content: 'IGST (18%):', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
          { content: `Rs. ${billingDetails.igstAmount.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
        ]
      );
    }
  
    tableBody.push(
      [
        { content: 'Grand Total:', colSpan: 3, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
        { content: `Rs. ${billingDetails.grandTotal.toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
      ]
    );
  
    // Add Table with Reduced Border Thickness
    doc.autoTable({
      head: [['Product Name', 'Quantity', 'Price', 'Total']],
      body: tableBody,
      startY: 140,
      theme: 'grid',
      headStyles: { fillColor: [211, 211, 211], textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] }, // Reduced lineWidth
      bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] }, // Reduced lineWidth
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
  
    doc.save(`invoice_${invoiceNumber}.pdf`);
  };
  

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    setFilteredProducts(
      products.filter(product => {
        const productName = product.name ? product.name.toLowerCase() : '';
        const productCode = product.productcode ? product.productcode.toLowerCase() : '';
        
        return productName.includes(term) || productCode.includes(term);
      })
    );
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updatedCart);
      updateBillingDetails(updatedCart);
    } else {
      const newItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      };
      const updatedCart = [...cart, newItem];
      setCart(updatedCart);
      updateBillingDetails(updatedCart);
    }
  };

  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    setCurrentDate(selectedDate);
  };

  return (
    <div className="billing-calculator">
      
    <div className="product-list">
      <input
        type="text"
        placeholder="Search Products"
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      <ul>
        {filteredProducts.map(product => (
          <li key={product.id}>
            <div className="product-details">
              <span>{product.name}</span>
              <span>Rs. {product.price.toFixed(2)}</span>
            </div>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </li>
        ))}
      </ul>
    </div>
    <div className="cart">
      <h2>Cart</h2>
      <ul>
        {cart.map(item => (
          <li key={item.productId}>
            <div className="cart-item">
              <span>{item.name}</span>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
              />
              <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="billing-summary">
        <div className="billing-details">
          <label>Discount (%)</label>
          <input
            type="number"
            value={billingDetails.discountPercentage}
            onChange={handleDiscountChange}
            min="0"
            max="100"
          />
          {/* <label>Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <label>Customer State</label>
          <input
            type="text"
            value={customerState}
            onChange={(e) => setCustomerState(e.target.value)}
          />
          <label>Customer Phone No</label>
          <input
          type="text"
          placeholder="Customer Phone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
        />
        <label>Customer Email</label>
        <input
          type="email"
          placeholder="Customer Email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        /> */}
          <label>Date</label>
          <input
            type="date"
           className="custom-datepicker"
            value={currentDate.toISOString().substr(0, 10)} // Display date in ISO format for input field
            onChange={(e) => setCurrentDate(new Date(e.target.value))}
          /><br></br><br></br>
          <label>Tax Option</label>
          <select value={taxOption} onChange={(e) => setTaxOption(e.target.value)}>
            <option value="cgst_sgst">CGST + SGST</option>
            <option value="igst">IGST</option>            
            <option value="no_tax">No Tax</option>
          </select>
        </div>
        <div className="billing-amounts">
          <table>
            <tbody>
              <tr>
                <td>Total Amount:</td>
                <td>Rs. {billingDetails.totalAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discounted Total:</td>
                <td>Rs. {billingDetails.discountedTotal.toFixed(2)}</td>
              </tr>
              {taxOption === 'cgst_sgst' && (
                <>
                  <tr>
                    <td>CGST (9%):</td>
                    <td>Rs. {billingDetails.cgstAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>SGST (9%):</td>
                    <td>Rs. {billingDetails.sgstAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
              {taxOption === 'igst' && (
                <tr>
                  <td>IGST (18%):</td>
                  <td>Rs. {billingDetails.igstAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="grand-total-row">
                <td>Grand Total:</td>
                <td>Rs. {billingDetails.grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="customer-details">
        <button onClick={() => setShowCustomerDetails(!showCustomerDetails)}>
          {showCustomerDetails ? 'Hide Customer Details' : 'Customer Details'}
        </button>
        {showCustomerDetails && (
          <>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Customer Address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="Customer State"
              value={customerState}
              onChange={(e) => setCustomerState(e.target.value)}
            />
            <input
              type="text"
              placeholder="Customer Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            <input
              type="text"
              placeholder="Customer GSTIN"
              value={customerGSTIN}
              onChange={(e) => setCustomerSGSTIN(e.target.value)}
            />
            <input
              type="text"
              placeholder="Customer PAN"
              value={customerPAN}
              onChange={(e) => setCustomerPAN(e.target.value)}
            />
            <input
              type="text"
              placeholder="Customer Email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </>
        )}
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  </div>
  );
};

export default BillingCalculator;
