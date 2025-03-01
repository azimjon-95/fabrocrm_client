import React, { useState, useEffect } from "react";
import { Button, List, message, Popover, Empty } from "antd";
import { FaAngleLeft } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import {
    useGetOrderListsQuery,
    useUpdateOrderListMutation
} from "../../context/service/listApi";
import socket from "../../socket";
import "./style.css";

const Distributor = () => {
    const { data, refetch } = useGetOrderListsQuery();
    const newLists = data?.innerData || null;
    const filteredLists = newLists?.filter(list => list.sentToDistributor && list.sentToDistributor === true);
    const [selectedListId, setSelectedListId] = useState(null);
    const [updateOrderList] = useUpdateOrderListMutation();

    useEffect(() => {
        socket.on("newMaterial", refetch);
        return () => {
            socket.off("newMaterial");
        };
    }, [refetch]);

    const handleToggleList = (id) => {
        setSelectedListId(selectedListId === id ? null : id);
    };


    const showCloseShops = async (record) => {
        try {
            const response = await updateOrderList({
                id: record._id,
                updateData: { sentToDistributor: false },
            });
            refetch();
            if (response) {
                message.success("Savdo yakunlandi!");
            } else {
                throw new Error("To‘lov amalga oshirilmadi.");
            }
        } catch (error) {
            message.error(error.message);
        }
    };
    const renderPopoverContent = (record) => (
        <div>
            <p style={{ margin: "10px 0" }}>Savdoni yakunlashni tasdiqlaysizmi?</p>
            <Button className="showCloseShops" type="primary" onClick={() => showCloseShops(record)}>
                <FaCheck /> Tasdiqlash
            </Button>
        </div>
    );


    return (
        <div className="stor_todolist-shop">
            {filteredLists?.length > 0 ? (
                filteredLists?.map((list, inx) => (
                    <div key={inx} className="order-list-container-shop">
                        {!selectedListId && (
                            <div className="order-header">
                                <strong>{inx + 1} Yangi Ro'yhat</strong>
                                <Button
                                    style={{ background: "#0A3D3A" }}
                                    type="primary"
                                    onClick={() => handleToggleList(list._id)}
                                >
                                    Xomashyolar
                                </Button>
                            </div>
                        )}

                        {selectedListId === list._id && (
                            <div className="list-container-shop">
                                <List
                                    bordered
                                    className="list-container"
                                    header={
                                        <div className="list-market-name">
                                            <Button
                                                type="default"
                                                onClick={() => handleToggleList(list._id)}
                                            >
                                                <FaAngleLeft />
                                            </Button>

                                            <div className="showCloseShops-box">
                                                <Popover
                                                    trigger="click"
                                                    content={renderPopoverContent(list)}
                                                    title="Savdoni yakunlash"
                                                >
                                                    <Button type="primary" className="showCloseShops">
                                                        <FaCheck />
                                                    </Button>
                                                </Popover>

                                            </div>
                                        </div>
                                    }
                                    dataSource={list?.materials}
                                    renderItem={(item) => (
                                        <List.Item key={item.productId} className="list-item-dist">
                                            <div className="item-info-dist">
                                                <span className="item-name-dist">{item.name}</span>
                                                <span className="item-quantity-dist">
                                                    {item.quantity} {item.unit}
                                                </span>
                                                <span className="item-price-dist">
                                                    {item?.pricePerUnit?.toLocaleString("uz-UZ")} so‘m
                                                </span>
                                                <span className="item-category-dist">{item.category}</span>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <Empty description="Buyurtmalar mavjud emas!" />
            )}

        </div>
    );
};

export default Distributor;

