'use client'

import React, { useState } from 'react'
import {
    FaPlus,
    FaEye,
    FaEdit,
    FaTrash,
    FaBox,
    FaChartLine,
    FaUsers,
    FaTimes,
    FaCheck
} from 'react-icons/fa'
import styles from './dashboard.module.css'

export default function ArtisanDashboard() {
    const [catalogItems, setCatalogItems] = useState([
        {
            id: '1',
            title: 'Traditional Moroccan Leather Pouf',
            category: 'Leather',
            price: 85,
            image: '/placeholder-logo.png',
            views: 1243,
            createdAt: '2024-01-15'
        },
        {
            id: '2',
            title: 'Hand-Woven Berber Rug',
            category: 'Textiles',
            price: 250,
            image: '/placeholder-logo.png',
            views: 892,
            createdAt: '2024-01-10'
        },
        {
            id: '3',
            title: 'Copper Tea Service',
            category: 'Metalwork',
            price: 120,
            image: '/placeholder-logo.png',
            views: 654,
            createdAt: '2024-01-05'
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        price: '',
        image: ''
    })

    const userData = {
        name: 'Younes Bakkali Terghi',
        email: 'younessbakkali09@gmail.com',
        role: 'CLIENT',
        profileImage: null,
        dashboardViews: 3847,
        totalListings: 3,
        joinDate: 'January 2024'
    }

    const handleAddNew = () => {
        setEditingItem(null)
        setFormData({ title: '', category: '', price: '', image: '' })
        setIsModalOpen(true)
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setFormData({
            title: item.title,
            category: item.category,
            price: item.price.toString(),
            image: item.image
        })
        setIsModalOpen(true)
    }

    const handleDelete = (id) => {
        setCatalogItems(catalogItems.filter(item => item.id !== id))
    }

    const handleSave = () => {
        if (editingItem) {
            setCatalogItems(catalogItems.map(item =>
                item.id === editingItem.id
                    ? {
                        ...item,
                        title: formData.title,
                        category: formData.category,
                        price: parseFloat(formData.price),
                        image: formData.image
                    }
                    : item
            ))
        } else {
            setCatalogItems([...catalogItems, {
                id: Date.now().toString(),
                title: formData.title,
                category: formData.category,
                price: parseFloat(formData.price),
                image: formData.image,
                views: 0,
                createdAt: new Date().toISOString().split('T')[0]
            }])
        }
        setIsModalOpen(false)
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const totalViews = catalogItems.reduce((sum, item) => sum + item.views, 0)

    return (
        <div className={styles.dashboard}>
            {/* Hero Section with Zelij Background */}
            <div className={styles.heroSection}>
                <div className={styles.zelijnOverlay}></div>
                <div className={styles.heroContent}>
                    <div className={styles.profileSection}>
                        <div className={styles.profileImage}>
                            {userData.profileImage ? (
                                <img src={userData.profileImage} alt={userData.name} />
                            ) : (
                                <div className={styles.profileInitials}>{userData.name.charAt(0)}</div>
                            )}
                        </div>
                        <div className={styles.profileInfo}>
                            <h1 className={styles.profileName}>{userData.name}</h1>
                            <p className={styles.profileEmail}>{userData.email}</p>
                            <span className={styles.roleBadge}>{userData.role}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.container}>
                {/* Analytics Cards */}
                <div className={styles.analyticsGrid}>
                    <div className={styles.analyticsCard}>
                        <div className={styles.cardContent}>
                            <div className={styles.cardIcon}>
                                <FaEye />
                            </div>
                            <div className={styles.cardDetails}>
                                <p className={styles.cardLabel}>Dashboard Views</p>
                                <h3 className={styles.cardValue}>{userData.dashboardViews.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    <div className={styles.analyticsCard}>
                        <div className={styles.cardContent}>
                            <div className={styles.cardIcon}>
                                <FaBox />
                            </div>
                            <div className={styles.cardDetails}>
                                <p className={styles.cardLabel}>Total Listings</p>
                                <h3 className={styles.cardValue}>{userData.totalListings}</h3>
                            </div>
                        </div>
                    </div>

                    <div className={styles.analyticsCard}>
                        <div className={styles.cardContent}>
                            <div className={styles.cardIcon}>
                                <FaChartLine />
                            </div>
                            <div className={styles.cardDetails}>
                                <p className={styles.cardLabel}>Total Product Views</p>
                                <h3 className={styles.cardValue}>{totalViews.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    <div className={styles.analyticsCard}>
                        <div className={styles.cardContent}>
                            <div className={styles.cardIcon}>
                                <FaUsers />
                            </div>
                            <div className={styles.cardDetails}>
                                <p className={styles.cardLabel}>Member Since</p>
                                <h3 className={styles.cardValue}>{userData.joinDate}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Catalog Management Section */}
                <div className={styles.catalogSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Your Catalog</h2>
                        <button
                            onClick={handleAddNew}
                            className={styles.addButton}
                        >
                            <FaPlus />
                            Add New Item
                        </button>
                    </div>

                    {/* Catalog Items Grid */}
                    <div className={styles.itemsGrid}>
                        {catalogItems.map(item => (
                            <div key={item.id} className={styles.itemCard}>
                                <div className={styles.itemImage}>
                                    <img src={item.image} alt={item.title} />
                                    <div className={styles.itemOverlay}>
                                        <div className={styles.itemActions}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleEdit(item)}
                                                title="Edit item"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleDelete(item.id)}
                                                title="Delete item"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.itemDetails}>
                                    <h4 className={styles.itemTitle}>{item.title}</h4>
                                    <p className={styles.itemCategory}>{item.category}</p>
                                    <div className={styles.itemMeta}>
                                        <span className={styles.itemPrice}>${item.price}</span>
                                        <span className={styles.itemViews}>{item.views} views</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {catalogItems.length === 0 && (
                        <div className={styles.emptyState}>
                            <FaBox />
                            <h3>No items yet</h3>
                            <p>Start building your catalog by adding your first item</p>
                            <button onClick={handleAddNew} className={styles.createBtn}>Create First Item</button>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className={styles.closeBtn}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className={styles.modalContent}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="title">Item Title</label>
                                    <input
                                        id="title"
                                        name="title"
                                        placeholder="e.g., Handwoven Moroccan Rug"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="category">Category</label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleFormChange}
                                            className={styles.select}
                                        >
                                            <option value="">Select category</option>
                                            <option value="Leather">Leather Goods</option>
                                            <option value="Textiles">Textiles</option>
                                            <option value="Metalwork">Metalwork</option>
                                            <option value="Ceramics">Ceramics</option>
                                            <option value="Woodwork">Woodwork</option>
                                            <option value="Jewelry">Jewelry</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="price">Price ($)</label>
                                        <input
                                            id="price"
                                            name="price"
                                            type="number"
                                            placeholder="99.99"
                                            value={formData.price}
                                            onChange={handleFormChange}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="image">Image URL</label>
                                    <input
                                        id="image"
                                        name="image"
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.image}
                                        onChange={handleFormChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className={styles.cancelBtn}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className={styles.saveBtn}
                                    >
                                        <FaCheck />
                                        {editingItem ? 'Update Item' : 'Create Item'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
