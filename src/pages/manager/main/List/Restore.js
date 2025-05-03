import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage } from 'react-icons/fi'; // Importing icons
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
// import { motion, AnimatePresence } from 'framer-motion';
import {
    Input,
    Button,
    message,
    Row,
    Col,
    Form,
} from 'antd';
import { GrAdd } from "react-icons/gr";
import { TbArrowBackUp } from "react-icons/tb";
import { IoMdImages } from "react-icons/io";
import {
    useGetOrderByIdQuery,
    useUpdateOrderMutation,
    useGiveMaterialSoldoMutation,
    useGetMaterialByIdQuery,
    useGetAllMaterialByIdQuery,
    useCreateOrderIntoInfoMutation,
    useDeleteOrderIntoInfoMutation,
    useUpdateMaterialValueMutation
} from '../../../../context/service/orderApi';
import { RxValueNone } from "react-icons/rx";
import { MdFileDownloadDone } from "react-icons/md";
import { IoMdAdd, IoMdRemoveCircle } from 'react-icons/io';
import AddMaterials from './AddMaterials';
import './Restore.css';


const MaterialItem = ({ orderId, orderCardId, material, index }) => {
    const { data: materialDetails, isLoading: materialLoading } = useGetMaterialByIdQuery({
        orderId,
        materialId: material.materialID,
    });

    const [updateMaterialValue, { isLoading: isUpdating }] = useUpdateMaterialValueMutation();

    const [editingStates, setEditingStates] = useState({});
    const [inputValues, setInputValues] = useState({});

    const filteredMaterials = useMemo(() => {
        if (!materialDetails?.materials) return [];
        return materialDetails.materials.filter((mat) => mat?.orderCardId === orderCardId);
    }, [materialDetails, orderCardId]);

    const handleSubmit = async (e, materialKey) => {
        e.preventDefault();
        const value = inputValues[materialKey];

        if (!value) {
            console.warn('No value to submit');
            return;
        }

        try {

            await updateMaterialValue({
                orderId,
                materialId: material.materialID,
                orderCardId,
                value: +value,
            }).unwrap();
            message.success("Material muvaffaqiyatli yangilandi");
            // Clear input and close form
            setInputValues((prev) => ({ ...prev, [materialKey]: '' }));
            setEditingStates((prev) => ({ ...prev, [materialKey]: false }));
        } catch (error) {
            message.error(error.data.message || 'Xatolik yuz berdi, qayta urinib ko‘ring!');
            // Optionally show an error message to the user
        }
    };

    const toggleEditing = (materialKey) => {
        setEditingStates((prev) => ({ ...prev, [materialKey]: !prev[materialKey] }));
    };

    if (materialLoading) {
        return <li className="loading-state">Yuklanmoqda...</li>;
    }

    if (!filteredMaterials.length) {
        return <li className="empty-state">Material topilmadi</li>;
    }

    return (
        <div style={{ width: '100%' }}>
            {filteredMaterials.map((mat, matIndex) => {
                const materialName = mat.materialName || mat.name || 'Nomaʼlum material';
                const quantity = mat.givenQuantity || mat.quantity || 0;
                const unit = mat.unit || '';
                const price = mat.price || 0;
                const key = mat._id || mat.materialId || `${orderId}-${index}-${matIndex}`;

                return (
                    <li key={key} className="material-details">
                        <span>
                            {materialName} - {quantity} {unit} (Jami: {price.toLocaleString()} soʻm)
                        </span>
                        <div className="material-actionsBox">
                            <form
                                onSubmit={(e) => handleSubmit(e, key)}
                                className={`form-container ${editingStates[key] ? 'open' : ''}`}
                            >
                                <input
                                    type="text"
                                    value={inputValues[key] || ''}
                                    onChange={(e) =>
                                        setInputValues((prev) => ({
                                            ...prev,
                                            [key]: e.target.value,
                                        }))
                                    }
                                    placeholder={`${quantity}-${unit}`}
                                    className="form-inputs"
                                    disabled={isUpdating} // Disable input during submission
                                />
                                <button
                                    type="submit"
                                    className="toggle-button"
                                    disabled={isUpdating} // Disable button during submission
                                >
                                    <MdFileDownloadDone />
                                </button>
                            </form>

                            <button
                                onClick={() => toggleEditing(key)}
                                className="toggle-button"
                                style={{
                                    backgroundColor: editingStates[key] ? 'red' : '',
                                }}
                                disabled={isUpdating} // Disable toggle during submission
                            >
                                {editingStates[key] ? <RxValueNone /> : <TbArrowBackUp className="button-icon" />}
                            </button>
                        </div>
                    </li>
                );
            })}
        </div>
    );
};



const Restore = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: orders, isLoading, refetch } = useGetOrderByIdQuery(id);
    const [updateOrder] = useUpdateOrderMutation();
    const [editSection, setEditSection] = useState(null);
    const [formData, setFormData] = useState(null);
    const [additionalInp, setAdditionalInp] = useState({});
    const [dateInput, setDateInput] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [giveMaterialSoldo] = useGiveMaterialSoldoMutation();
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const order = orders?.innerData || [];
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [createOrderIntoInfo] = useCreateOrderIntoInfoMutation();
    const [deleteOrderIntoInfo] = useDeleteOrderIntoInfoMutation();
    // useGiveMaterialMutation
    const { data: GiveOrders, } = useGetAllMaterialByIdQuery(id);

    const [formOrder, setFormOrder] = useState({
        name: '',
        quantity: '',
        budget: '',
        dimensions: {
            length: '',
            width: '',
            height: '',
        },
        description: '',
    });


    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const showModal = (material) => {
        setSelectedMaterial(material);
        setIsModalVisible(true);
    };



    if (isLoading) return <div className="restore-container">Loading...</div>;

    // Optimized date formatting function
    const formatDateForInput = (dateString) => {
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
    };

    const startEdit = (section) => {
        setEditSection(section);
        if (!formData) {
            const newFormData = { ...order };
            setFormData(newFormData);
            setDateInput(formatDateForInput(newFormData.date));
        }
    };

    const saveChanges = async () => {
        try {
            if (!formData) return;

            const updates = { ...formData };

            // Validate and convert dateInput to ISO format
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

            const res = await updateOrder({ id: order._id, updates });
            message.success(res.data.message);
            refetch();
            setEditSection(null);
            setDateInput('');
        } catch (error) {
            message.error('Xatolik yuz berdi');
        }
    };

    const handleInputChange = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
    };

    const handleSimpleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateInputChange = (value) => {
        setDateInput(value);
        if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [month, day, year] = value.split('/');
            const parsedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
            if (!isNaN(parsedDate)) {
                handleSimpleInputChange('date', parsedDate.toISOString());
            }
        }
    };

    const handleAdditionalChange = (record, value) => {
        setAdditionalInp((prev) => ({ ...prev, [record?._id]: value }));
    };

    //deleteOrderIntoInfo url: `/orderIntoInfo/${infoId}/orders/${orderId}`,
    const handleDeleteOrderIntoInfo = async (infoId, orderId) => {
        try {

            const response = await deleteOrderIntoInfo({
                infoId: infoId.infoId,
                orderId: infoId.orderId,
            }).unwrap();

            message.success(response.message || 'Buyurtma muvaffaqiyatli o‘chirildi!');
            refetch();
        } catch (error) {
            message.error(error.data?.message || "Xatolik yuz berdi, qayta urinib ko‘ring!");
        }
    };

    const handleAdd = async (record) => {
        const quantity = additionalInp[record._id];

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            message.error("Iltimos, to‘g‘ri miqdor kiriting!");
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
            message.error(error.data?.message || "Xatolik yuz berdi, qayta urinib ko‘ring!");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') saveChanges();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (["length", "width", "height"].includes(name)) {
            // O'lchamlar (dimensions) obyektini yangilash
            setFormOrder((prevData) => ({
                ...prevData,
                dimensions: {
                    ...prevData.dimensions,
                    [name]: value,
                },
            }));
        } else {
            // Barcha boshqa maydonlarni (name, budget, quantity) yangilash
            setFormOrder((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(file);
                setFile(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveFurniture = async () => {
        if (formOrder?.name && formOrder?.budget && file) {

            const formData = new FormData();
            formData.append("name", formOrder?.name);
            formData.append("length", formOrder?.dimensions.length);
            formData.append("width", formOrder?.dimensions.width);
            formData.append("height", formOrder?.dimensions.height);
            formData.append("quantity", +formOrder?.quantity);
            formData.append("originalPrice", +formOrder?.budget * +formOrder?.quantity);
            formData.append("budget", order?.nds
                ? (+formOrder?.budget * +formOrder?.quantity * (1 + order.nds / 100))
                : (+formOrder?.budget * +formOrder?.quantity)
            );
            formData.append("description", formOrder?.description || "");
            if (imageUrl) {
                formData.append("image", imageUrl);
            }
            createOrderIntoInfo({ infoId: id, formData });
            // Agar siz createOrderIntoInfo ni FormData bilan yuboradigan qilgan bo‘lsangiz:

            // Forma tozalanadi
            setFormOrder({
                name: "",
                dimensions: { length: "", width: "", height: "" },
                quantity: 0,
                budget: "",
                description: "",
            });
            setFile(null);
        }
    };
    const totalBudget = order.orders.reduce((sum, item) => sum + (item.budget || 0), 0);
    const totalPrice = GiveOrders?.innerData?.reduce((sum, item) => sum + (item.price || 0), 0);

    return (
        <div className="order-details-container">

            <div className="order-details-header">
                <button
                    className="btnD btn-back"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                >
                    <FiArrowLeft className="btn-icon" /> Orqaga
                </button>

                <h2 className="order-details-title">Buyurtma Tafsilotlari</h2>

                <button
                    className="btnD btn-warehouse"
                    onClick={() => navigate(`/order/mengement/${order?._id}`)}
                    aria-label="Go to warehouse"
                >
                    <FiPackage className="btn-icon" /> Omborga o'tish
                </button>
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
                                value={formData.customer.type || ''}
                                onChange={(val) => handleInputChange('customer', 'type', val)}
                                onKeyDown={handleKeyDown}
                            />
                        )}
                        {order?.customer?.companyName && order.customer.companyName !== 'undefined' && (
                            <InputItem
                                label="Kompaniya"
                                value={formData.customer.companyName || ''}
                                onChange={(val) => handleInputChange('customer', 'companyName', val)}
                                onKeyDown={handleKeyDown}
                            />
                        )}
                        {order.customer.director && order.customer.director !== 'undefined' && (
                            <InputItem
                                label="Direktor"
                                value={formData.customer.director || ''}
                                onChange={(val) => handleInputChange('customer', 'director', val)}
                                onKeyDown={handleKeyDown}
                            />
                        )}
                        <InputItem
                            label="Masul shaxs"
                            value={formData.customer.fullName || ''}
                            onChange={(val) => handleInputChange('customer', 'fullName', val)}
                            onKeyDown={handleKeyDown}
                        />
                        <InputItem
                            label="Telefon"
                            value={formData.customer.phone || ''}
                            onChange={(val) => handleInputChange('customer', 'phone', val)}
                            onKeyDown={handleKeyDown}
                        />
                        {order?.customer?.inn && (
                            <InputItem
                                label="INN"
                                value={formData.customer.inn || ''}
                                onChange={(val) => handleInputChange('customer', 'inn', val)}
                                onKeyDown={handleKeyDown}
                            />
                        )}
                    </>
                ) : (
                    <>
                        {order?.customer?.type && order.customer.type !== 'undefined' && (
                            <p>
                                <strong>Turi:</strong> {order.customer.type}
                            </p>
                        )}
                        {order?.customer?.companyName && order.customer.companyName !== 'undefined' && (
                            <p>
                                <strong>Kompaniya:</strong> {order.customer.companyName}
                            </p>
                        )}
                        {order.customer.director && order.customer.director !== 'undefined' && (
                            <p>
                                <strong>Direktor:</strong> {order.customer.director}
                            </p>
                        )}
                        <p>
                            <strong>Masul shaxs:</strong> {order.customer.fullName}
                        </p>
                        <p>
                            <strong>Telefon:</strong> {order.customer.phone}
                        </p>
                        {order.customer.inn && order.customer.inn !== '' && (
                            <p>
                                <strong>INN:</strong> {order.customer.inn}
                            </p>
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
                            value={formData.address.region}
                            onChange={(val) => handleInputChange('address', 'region', val)}
                            onKeyDown={handleKeyDown}
                        />
                        <InputItem
                            label="Tuman"
                            value={formData.address.district}
                            onChange={(val) => handleInputChange('address', 'district', val)}
                            onKeyDown={handleKeyDown}
                        />
                        <InputItem
                            label="Joylashuv"
                            value={formData.address.location}
                            onChange={(val) => handleInputChange('address', 'location', val)}
                            onKeyDown={handleKeyDown}
                        />
                        <InputItem
                            label="Ko'cha"
                            value={formData.address.street}
                            onChange={(val) => handleInputChange('address', 'street', val)}
                            onKeyDown={handleKeyDown}
                        />
                    </>
                ) : (
                    <>
                        <p><strong>Viloyat:</strong> {order.address.region}</p>
                        <p><strong>Tuman:</strong> {order.address.district}</p>
                        <p><strong>Joylashuv:</strong> {order.address.location}</p>
                        <p><strong>Ko'cha:</strong> {order.address.street}</p>
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
                            onKeyDown={handleKeyDown}
                            placeholder="MM/DD/YYYY"
                        />
                        <InputItem
                            label="Taxminiy kunlar"
                            value={formData.estimatedDays}
                            onChange={(val) => handleSimpleInputChange('estimatedDays', val)}
                            onKeyDown={handleKeyDown}
                        />
                        <InputItem
                            label="Qo‘shimcha xarajatlar"
                            value={formData.extraExpenses}
                            onChange={(val) => handleSimpleInputChange('extraExpenses', val)}
                            onKeyDown={handleKeyDown}
                        />
                        <InputItem
                            label="NDS (%)"
                            value={formData.nds}
                            onChange={(val) => handleSimpleInputChange('nds', val)}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="input-item" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <strong>Holati:</strong>
                            <label style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    name="isActive"
                                    value="true"
                                    checked={formData.isActive === true}
                                    onChange={() => handleSimpleInputChange('isActive', true)}
                                />
                                Faol
                            </label>
                            <label style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    name="isActive"
                                    value="false"
                                    checked={formData.isActive === false}
                                    onChange={() => handleSimpleInputChange('isActive', false)}
                                />
                                Faol emas
                            </label>
                        </div>
                        <InputItem
                            label="To'langan"
                            value={formData.paid}
                            onChange={(val) => handleSimpleInputChange('paid', val)}
                            onKeyDown={handleKeyDown}
                        />
                    </>
                ) : (
                    <>
                        <p><strong>Buyurtma sanasi:</strong> {formatDateForInput(order.date)}</p>
                        <p><strong>Taxminiy kunlar:</strong> {order.estimatedDays} kun</p>
                        <p><strong>Qo‘shimcha xarajatlar:</strong> {order.extraExpenses} soʻm</p>
                        <p><strong>NDS (%):</strong> {order.nds}%</p>
                        <p><strong>Holati:</strong> {order.isActive ? 'Faol' : 'Faol emas'}</p>
                        <p><strong>To'langan:</strong> {order.paid.toLocaleString()} soʻm</p>
                    </>
                )}
            </div>

            {/* Order Details */}
            <div className="order-details-section">
                <h3 className="order-details-section-title">Buyurtma tafsilotlari</h3>
                <p><strong>Buyurtma (klientga) umumiy narxi:</strong> {totalBudget.toLocaleString()} soʻm</p>
                <p><strong>Materiallar (sarflangan) umumiy tannarxi:</strong> {totalPrice.toLocaleString()} soʻm</p>

            </div>

            <div className="addOder_box">
                <h3 className="order-details-section-title">Mebel qo'shish</h3>
                <Form layout="vertical">
                    <Row gutter={12}>
                        <Col span={6}>
                            <Form.Item label="Mebel nomi">
                                <Input
                                    name="name"
                                    value={formOrder?.name}
                                    onChange={handleChange}
                                    placeholder="Mebel nomini kiriting"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label="Miqdori">
                                <Input
                                    name="quantity"
                                    value={formOrder?.quantity}
                                    onChange={handleChange}
                                    placeholder="Mebel sonini kiriting"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label="Budjeti">
                                <Input
                                    name="budget"
                                    value={formOrder?.budget}
                                    onChange={handleChange}
                                    placeholder="Mebel narxini kiriting"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label="Uzunligi (sm)">
                                <Input
                                    name="length"
                                    value={formOrder?.dimensions.length}
                                    onChange={handleChange}
                                    placeholder="Uzunlik (sm)"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label="Eni (sm)">
                                <Input
                                    name="width"
                                    value={formOrder?.dimensions.width}
                                    onChange={handleChange}
                                    placeholder="Eni (sm)"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label="Balandligi (sm)">
                                <Input
                                    name="height"
                                    value={formOrder?.dimensions.height}
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
                                    onClick={() => handleSaveFurniture()}
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
                {order.orders.map((item) => (
                    <div key={item._id} className="order-details-product-card">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="order-details-product-image"
                        />
                        <div className="order-details-product-btn">
                            <Button
                                type="text"
                                onClick={() =>
                                    handleDeleteOrderIntoInfo({
                                        infoId: id,
                                        orderId: item._id,
                                    })
                                }
                            >
                                <IoMdRemoveCircle style={{ color: 'red', fontSize: '20px' }} />
                            </Button>
                            <Button type="text"
                                onClick={() =>
                                    showModal({
                                        orderId: id,
                                        orderCardId: item._id,
                                    })
                                }
                            >
                                <IoMdAdd style={{ color: 'green', fontSize: '20px' }} />
                            </Button>
                        </div>
                        <div className="order-details-product-info">
                            <h4 className="order-details-product-name">{item.name}</h4>
                            <p><strong>Miqdor:</strong> {item.quantity} dona</p>
                            <p><strong>Asl narxi:</strong> {item.originalPrice.toLocaleString()} soʻm</p>
                            <p><strong>Byudjet: {order.nds ? "+" : ""} {order.nds ? `${order.nds}% NDS:` : ''}</strong> {item.budget.toLocaleString()} soʻm</p>
                            <div className="order-details-materials">
                                <strong>Sariflangan Materiallar:</strong>
                                <ul className="order-details-materials-list">
                                    {item.materials.map((material, idx) => (
                                        <MaterialItem key={idx} orderCardId={item._id} orderId={id} material={material} index={idx} />
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Section */}
            <div className={isModalVisible ? 'modal-container visible' : 'modal-container hidden'}>
                <div className="modal-content" style={{ width: 650 }}>
                    <div className="modal-header">
                        <h2>Material Tafsilotlari</h2>
                        <button className="modal-close" onClick={handleCancel}>×</button>
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
        </div>
    );
};

const InputItem = ({ label, value, onChange, disabled = false, onKeyDown, placeholder }) => {
    const width = `${Math.max((value?.toString()?.length || 1) * 8.2, 100)}px`;
    return (
        <div className="input-item">
            <strong>{label}:</strong>{' '}
            <Input
                className="restore-input"
                style={{ width }}
                value={value ?? ''}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
            />
        </div>
    );
};

export default Restore;


