import { memo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage } from 'react-icons/fi';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Input, Button, message, Row, Col, Form } from 'antd';
import { GrAdd } from 'react-icons/gr';
import { IoMdImages, IoMdAdd, IoMdRemoveCircle } from 'react-icons/io';
import {
    useGetOrderByIdQuery,
    useUpdateOrderMutation,
    useGiveMaterialSoldoMutation,
    useGetAllMaterialByIdQuery,
    useCreateOrderIntoInfoMutation,
    useDeleteOrderIntoInfoMutation,
    useEditGivnMaterialMutation
} from '../../../../context/service/orderApi';
import AddMaterials from './AddMaterials';
import './Restore.css';
import { TbArrowBackUp } from "react-icons/tb";


const MaterialItem = memo(({ material }) => {
    const [quantityInput, setQuantityInput] = useState('');
    const [updateMaterial] = useEditGivnMaterialMutation();

    const handleSubmit = useCallback(async (id) => {
        const quantity = Number(quantityInput);
        try {
            await updateMaterial({ id: material._id, quantity: quantity }).unwrap()
            setQuantityInput('');
            message.success('Material updated successfully');
        } catch {
            message.error('Failed to update material');
        }
    }, [material.givenQuantity, quantityInput, updateMaterial]);

    const isButtonDisabled = !quantityInput || Number(quantityInput) > material.givenQuantity;

    return (
        <div className="material-details" style={{ display: 'flex', alignItems: 'center', padding: '1px 0' }}>
            <li style={{ flex: 1, listStyle: 'none' }}>
                {material.materialName} - {material.givenQuantity} {material.unit} (Total: {material.price.toLocaleString()} soʻm)
            </li>
            <Input
                type="number"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                style={{ width: 80, height: 32, marginRight: 8 }}
                placeholder="Quantity"
                id={`input-${material._id}`}
            />
            <Button
                onClick={() => handleSubmit(material._id)}
                style={{ padding: '4px 8px' }}
                id={`button-${material._id}`}
                disabled={isButtonDisabled}
            >
                <TbArrowBackUp />
            </Button>
        </div>
    );
});

const Restore = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: orders, isLoading, refetch } = useGetOrderByIdQuery(id, { skip: !id });
    const [updateOrder] = useUpdateOrderMutation();
    const [editSection, setEditSection] = useState(null);
    const [formData, setFormData] = useState(null);
    const [dateInput, setDateInput] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [giveMaterialSoldo] = useGiveMaterialSoldoMutation();
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [additionalInp, setAdditionalInp] = useState({});
    const [formOrder, setFormOrder] = useState({
        name: '',
        quantity: '',
        budget: '',
        dimensions: { length: '', width: '', height: '' },
        description: '',
    });
    const [file, setFile] = useState(null);
    const [createOrderIntoInfo] = useCreateOrderIntoInfoMutation();
    const [deleteOrderIntoInfo] = useDeleteOrderIntoInfoMutation();
    const { data: giveOrders } = useGetAllMaterialByIdQuery(id, { skip: !id });
    const order = orders?.innerData || [];
    const formatDateForInput = useCallback((dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            });
        } catch {
            return '';
        }
    }, []);

    const startEdit = useCallback(
        (section) => {
            setEditSection(section);
            if (!formData) {
                const newFormData = { ...order };
                setFormData(newFormData);
                setDateInput(formatDateForInput(newFormData.date));
            }
        },
        [formData, order, formatDateForInput]
    );

    const saveChanges = useCallback(async () => {
        try {
            if (!formData) return;
            const updates = { ...formData };

            if (dateInput && dateInput.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                const [month, day, year] = dateInput.split('/');
                const parsedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
                if (!isNaN(parsedDate)) {
                    updates.date = parsedDate.toISOString();
                } else {
                    message.error('Noto‘g‘ri sana formati');
                    return;
                }
            } else {
                message.error('Iltimos, to‘liq sana kiriting (MM/DD/YYYY)');
                return;
            }

            const res = await updateOrder({ id: order?._id, updates }).unwrap();
            message.success(res.message);
            refetch();
            setEditSection(null);
            setDateInput('');
        } catch (error) {
            message.error('Xatolik yuz berdi');
        }
    }, [formData, dateInput, updateOrder, order?._id, refetch]);

    const handleInputChange = useCallback((section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
    }, []);

    const handleSimpleInputChange = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleDateInputChange = useCallback(
        (value) => {
            setDateInput(value);
            if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                const [month, day, year] = value.split('/');
                const parsedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
                if (!isNaN(parsedDate)) {
                    handleSimpleInputChange('date', parsedDate.toISOString());
                }
            }
        },
        [handleSimpleInputChange]
    );

    const handleAdditionalChange = useCallback((record, value) => {
        setAdditionalInp((prev) => ({ ...prev, [record?._id]: value }));
    }, []);

    const handleDeleteOrderIntoInfo = useCallback(
        async (infoId, orderId) => {
            try {
                const response = await deleteOrderIntoInfo({ infoId, orderId }).unwrap();
                message.success(response.message || 'Buyurtma muvaffaqiyatli o‘chirildi!');
                refetch();
            } catch (error) {
                message.error(error.data?.message || 'Xatolik yuz berdi!');
            }
        },
        [deleteOrderIntoInfo, refetch]
    );

    const handleAdd = useCallback(
        async (record) => {
            const quantity = additionalInp[record._id];
            if (!quantity || isNaN(quantity) || quantity <= 0) {
                message.error('Iltimos, to‘g‘ri miqdor kiriting!');
                return;
            }

            try {
                const response = await giveMaterialSoldo({
                    orderCardId: selectedMaterial.orderCardId,
                    orderId: id,
                    materialName: record.name,
                    price: record.pricePerUnit * +quantity,
                    givenQuantity: +quantity,
                }).unwrap();
                message.success(response.message || 'Material muvaffaqiyatli berildi!');
                setAdditionalInp((prev) => ({ ...prev, [record._id]: '' }));
            } catch (error) {
                message.error(error.data?.message || 'Xatolik yuz berdi!');
            }
        },
        [additionalInp, giveMaterialSoldo, id, selectedMaterial]
    );

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        if (['length', 'width', 'height'].includes(name)) {
            setFormOrder((prev) => ({
                ...prev,
                dimensions: { ...prev.dimensions, [name]: value },
            }));
        } else {
            setFormOrder((prev) => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            setFile(file);
        }
    }, []);

    const handleSaveFurniture = useCallback(async () => {
        if (!formOrder.name || !formOrder.budget || !formOrder.quantity || !file) {
            message.error('Iltimos, barcha majburiy maydonlarni to‘ldiring!');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', formOrder.name);
            formData.append('length', formOrder.dimensions.length);
            formData.append('width', formOrder.dimensions.width);
            formData.append('height', formOrder.dimensions.height);
            formData.append('quantity', +formOrder.quantity);
            formData.append('originalPrice', +formOrder.budget * +formOrder.quantity);
            formData.append(
                'budget',
                order?.nds
                    ? +formOrder.budget * +formOrder.quantity * (1 + order.nds / 100)
                    : +formOrder.budget * +formOrder.quantity
            );
            formData.append('description', formOrder.description || '');
            formData.append('image', file);

            await createOrderIntoInfo({ infoId: id, formData }).unwrap();
            message.success('Mebel muvaffaqiyatli qo‘shildi!');
            setFormOrder({
                name: '',
                quantity: '',
                budget: '',
                dimensions: { length: '', width: '', height: '' },
                description: '',
            });
            setFile(null);
            refetch();
        } catch (error) {
            message.error(error.data?.message || 'Mebel qo‘shishda xatolik yuz berdi!');
        }
    }, [formOrder, file, order?.nds, createOrderIntoInfo, id, refetch]);

    const showModal = useCallback((material) => {
        setSelectedMaterial(material);
        setIsModalVisible(true);
    }, []);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
        setSelectedMaterial(null);
    }, []);

    if (isLoading) return <div className="restore-container">Yuklanmoqda...</div>;

    const totalBudget = order?.orders?.reduce((sum, item) => sum + (item.budget || 0), 0) || 0;
    const totalPrice = giveOrders?.innerData?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;


    return (
        <div className="order-details-container">
            <div className="order-details-header">
                <Button
                    className="btnD btn-back"
                    onClick={() => navigate(-1)}
                    icon={<FiArrowLeft />}
                >
                    Orqaga
                </Button>
                <h2 className="order-details-title">Buyurtma Tafsilotlari</h2>
                <Button
                    className="btnD btn-warehouse"
                    onClick={() => navigate(`/order/mengement/${order?._id}`)}
                    icon={<FiPackage />}
                >
                    Omborga o'tish
                </Button>
            </div>

            {/* Customer Information */}
            <div className="order-details-section">
                <div className="order-details-section-header">
                    <h3 className="order-details-section-title">Mijoz Maʼlumotlari</h3>
                    {editSection === 'customer' ? (
                        <SaveOutlined className="edit-icon" onClick={saveChanges} />
                    ) : (
                        <EditOutlined className="edit-icon" onClick={() => startEdit('customer')} />
                    )}
                </div>
                {editSection === 'customer' ? (
                    <>
                        {order?.customer?.type && (
                            <InputItem
                                label="Turi"
                                value={formData?.customer?.type || ''}
                                onChange={(val) => handleInputChange('customer', 'type', val)}
                            />
                        )}
                        {order?.customer?.companyName && order.customer?.companyName !== 'undefined' && (
                            <InputItem
                                label="Kompaniya"
                                value={formData?.customer?.companyName || ''}
                                onChange={(val) => handleInputChange('customer', 'companyName', val)}
                            />
                        )}
                        {order?.customer?.director && order.customer?.director !== 'undefined' && (
                            <InputItem
                                label="Direktor"
                                value={formData?.customer?.director || ''}
                                onChange={(val) => handleInputChange('customer', 'director', val)}
                            />
                        )}
                        <InputItem
                            label="Masul shaxs"
                            value={formData?.customer?.fullName || ''}
                            onChange={(val) => handleInputChange('customer', 'fullName', val)}
                        />
                        <InputItem
                            label="Telefon"
                            value={formData?.customer?.phone || ''}
                            onChange={(val) => handleInputChange('customer', 'phone', val)}
                        />
                        {order?.customer?.inn && (
                            <InputItem
                                label="INN"
                                value={formData?.customer?.inn || ''}
                                onChange={(val) => handleInputChange('customer', 'inn', val)}
                            />
                        )}
                    </>
                ) : (
                    <>
                        {order?.customer?.type && order.customer?.type !== 'undefined' && (
                            <p><strong>Turi:</strong> {order.customer?.type}</p>
                        )}
                        {order?.customer?.companyName && order.customer?.companyName !== 'undefined' && (
                            <p><strong>Kompaniya:</strong> {order.customer?.companyName}</p>
                        )}
                        {order?.customer?.director && order.customer?.director !== 'undefined' && (
                            <p><strong>Direktor:</strong> {order.customer?.director}</p>
                        )}
                        <p><strong>Masul shaxs:</strong> {order.customer?.fullName}</p>
                        <p><strong>Telefon:</strong> {order.customer?.phone}</p>
                        {order?.customer?.inn && order.customer?.inn !== '' && (
                            <p><strong>INN:</strong> {order.customer?.inn}</p>
                        )}
                    </>
                )}
            </div>

            {/* Address */}
            <div className="order-details-section">
                <div className="order-details-section-header">
                    <h3 className="order-details-section-title">Manzil</h3>
                    {editSection === 'address' ? (
                        <SaveOutlined className="edit-icon" onClick={saveChanges} />
                    ) : (
                        <EditOutlined className="edit-icon" onClick={() => startEdit('address')} />
                    )}
                </div>
                {editSection === 'address' ? (
                    <>
                        <InputItem
                            label="Viloyat"
                            value={formData?.address?.region || ''}
                            onChange={(val) => handleInputChange('address', 'region', val)}
                        />
                        <InputItem
                            label="Tuman"
                            value={formData?.address?.district || ''}
                            onChange={(val) => handleInputChange('address', 'district', val)}
                        />
                        <InputItem
                            label="Joylashuv"
                            value={formData?.address?.location || ''}
                            onChange={(val) => handleInputChange('address', 'location', val)}
                        />
                        <InputItem
                            label="Ko'cha"
                            value={formData?.address?.street || ''}
                            onChange={(val) => handleInputChange('address', 'street', val)}
                        />
                    </>
                ) : (
                    <>
                        <p><strong>Viloyat:</strong> {order?.address?.region}</p>
                        <p><strong>Tuman:</strong> {order?.address?.district}</p>
                        <p><strong>Joylashuv:</strong> {order?.address?.location}</p>
                        <p><strong>Ko'cha:</strong> {order?.address?.street}</p>
                    </>
                )}
            </div>

            {/* Order Details */}
            <div className="order-details-section">
                <div className="order-details-section-header">
                    <h3 className="order-details-section-title">Buyurtma Tafsilotlari</h3>
                    {editSection === 'order' ? (
                        <SaveOutlined className="edit-icon" onClick={saveChanges} />
                    ) : (
                        <EditOutlined className="edit-icon" onClick={() => startEdit('order')} />
                    )}
                </div>
                {editSection === 'order' ? (
                    <>
                        <InputItem
                            label="Buyurtma sanasi"
                            value={dateInput}
                            onChange={handleDateInputChange}
                            placeholder="MM/DD/YYYY"
                        />
                        <InputItem
                            label="Taxminiy kunlar"
                            value={formData?.estimatedDays || ''}
                            onChange={(val) => handleSimpleInputChange('estimatedDays', val)}
                        />
                        <InputItem
                            label="Qo‘shimcha xarajatlar"
                            value={formData?.extraExpenses || ''}
                            onChange={(val) => handleSimpleInputChange('extraExpenses', val)}
                        />
                        <InputItem
                            label="NDS (%)"
                            value={formData?.nds || ''}
                            onChange={(val) => handleSimpleInputChange('nds', val)}
                        />
                        <div className="input-item" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <strong>Holati:</strong>
                            <label style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    name="isActive"
                                    value="true"
                                    checked={formData?.isActive === true}
                                    onChange={() => handleSimpleInputChange('isActive', true)}
                                />
                                Faol
                            </label>
                            <label style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    name="isActive"
                                    value="false"
                                    checked={formData?.isActive === false}
                                    onChange={() => handleSimpleInputChange('isActive', false)}
                                />
                                Faol emas
                            </label>
                        </div>
                        <InputItem
                            label="To'langan"
                            value={formData?.paid || ''}
                            onChange={(val) => handleSimpleInputChange('paid', val)}
                        />
                    </>
                ) : (
                    <>
                        <p><strong>Buyurtma sanasi:</strong> {formatDateForInput(order?.date)}</p>
                        <p><strong>Taxminiy kunlar:</strong> {order?.estimatedDays} kun</p>
                        <p><strong>Qo‘shimcha xarajatlar:</strong> {order?.extraExpenses?.toLocaleString()} soʻm</p>
                        <p><strong>NDS (%):</strong> {order?.nds}%</p>
                        <p><strong>Holati:</strong> {order?.isActive ? 'Faol' : 'Faol emas'}</p>
                        <p><strong>To'langan:</strong> {order?.paid?.toLocaleString()} soʻm</p>
                    </>
                )}
            </div>

            {/* Order Summary */}
            <div className="order-details-section">
                <h3 className="order-details-section-title">Buyurtma Tafsilotlari</h3>
                <p><strong>Buyurtma (klientga) umumiy narxi:</strong> {totalBudget.toLocaleString()} soʻm</p>
                <p><strong>Materiallar (sarflangan) umumiy tannarxi:</strong> {totalPrice.toLocaleString()} soʻm</p>
            </div>

            {/* Add Furniture Form */}
            <div className="addOder_box">
                <h3 className="order-details-section-title">Mebel qo'shish</h3>
                <Form layout="vertical">
                    <Row gutter={12}>
                        <Col span={6}>
                            <Form.Item label="Mebel nomi">
                                <Input
                                    name="name"
                                    value={formOrder.name}
                                    onChange={handleChange}
                                    placeholder="Mebel nomini kiriting"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label="Miqdori">
                                <Input
                                    name="quantity"
                                    value={formOrder.quantity}
                                    onChange={handleChange}
                                    placeholder="Mebel sonini kiriting"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label="Budjeti">
                                <Input
                                    name="budget"
                                    value={formOrder.budget}
                                    onChange={handleChange}
                                    placeholder="Mebel narxini kiriting"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label="Uzunligi (sm)">
                                <Input
                                    name="length"
                                    value={formOrder.dimensions.length}
                                    onChange={handleChange}
                                    placeholder="Uzunlik (sm)"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label="Eni (sm)">
                                <Input
                                    name="width"
                                    value={formOrder.dimensions.width}
                                    onChange={handleChange}
                                    placeholder="Eni (sm)"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label="Balandligi (sm)">
                                <Input
                                    name="height"
                                    value={formOrder.dimensions.height}
                                    onChange={handleChange}
                                    placeholder="Balandlik (sm)"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={1.5}>
                            <Form.Item label="Rasm">
                                <label className="uploadButton">
                                    <IoMdImages />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="uploadInput"
                                    />
                                </label>
                            </Form.Item>
                        </Col>
                        <Col span={1.5}>
                            <Form.Item label="Qo'shish">
                                <Button
                                    type="primary"
                                    onClick={handleSaveFurniture}
                                    className="saveButton"
                                >
                                    <GrAdd />
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>

            {/* Products Section */}
            <div className="order-details-section">
                <h3 className="order-details-section-title">Mahsulotlar</h3>
                {order?.orders?.map((item) => (
                    <div key={item._id} className="order-details-product-card">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="order-details-product-image"
                        />
                        <div className="order-details-product-btn">
                            <Button
                                type="text"
                                onClick={() => handleDeleteOrderIntoInfo(id, item._id)}
                            >
                                <IoMdRemoveCircle style={{ color: 'red', fontSize: '20px' }} />
                            </Button>
                            <Button
                                type="text"
                                onClick={() => showModal({ orderId: id, orderCardId: item._id })}
                            >
                                <IoMdAdd style={{ color: 'green', fontSize: '20px' }} />
                            </Button>
                        </div>
                        <div className="order-details-product-info">
                            <h4 className="order-details-product-name">{item.name}</h4>
                            <p><strong>Miqdor:</strong> {item.quantity} dona</p>
                            <p><strong>Asl narxi:</strong> {item.originalPrice.toLocaleString()} soʻm</p>
                            <p>
                                <strong>Byudjet: {order?.nds ? `+${order.nds}% NDS:` : ''}</strong>{' '}
                                {item.budget.toLocaleString()} soʻm
                            </p>
                            <div className="order-details-materials">
                                <strong>Sariflangan Materiallar:</strong>
                                <ul className="order-details-materials-list">
                                    {item?.materialsGiven?.map((material, idx) => (
                                        <MaterialItem
                                            key={idx}
                                            material={material}
                                        />
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Section */}
            {isModalVisible && (
                <div className="modal-container visible">
                    <div className="modal-content" style={{ width: 650 }}>
                        <div className="modal-header">
                            <h2>Material Tafsilotlari</h2>
                            <button className="modal-close" onClick={handleCancel}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <AddMaterials
                                inputValues={additionalInp}
                                handleAdd={handleAdd}
                                handleInputChange={handleAdditionalChange}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputItem = ({ label, value, onChange, placeholder }) => {
    const width = `${Math.max((value?.toString()?.length || 1) * 8.2, 100)}px`;
    return (
        <div className="input-item">
            <strong>{label}:</strong>{' '}
            <Input
                className="restore-input"
                style={{ width }}
                value={value ?? ''}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};

export default Restore;


