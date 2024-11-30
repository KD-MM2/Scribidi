import type { FormProps } from "antd";
import { Button, Card, Form, Input } from "antd";

import React from "react";
import { redirect } from "react-router-dom";

import { authProvider } from "@/lib/router";
import { RegisterInfo } from "@/types/schemas";

const onFinish: FormProps<RegisterInfo>["onFinish"] = (values) => {
	console.log("Success:", values);
	authProvider
		.signup(values.name, values.email, values.password)
		.then((user) => {
			console.log("User:", user);
			console.log(
				"onFinish: FormProps<RegisterInfo>['onFinish']: Redirecting to /"
			);
			window.location.href = "/";
		})
		.catch((error) => {
			console.error("Error:", error);
		});
};

const onFinishFailed: FormProps<RegisterInfo>["onFinishFailed"] = (
	errorInfo
) => {
	console.log("Failed:", errorInfo);
};

const Register: React.FC = () => (
	<Card
		style={{
			width: 400,
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
		}}
	>
		<Form
			name="basic"
			labelCol={{ span: 6 }}
			wrapperCol={{ span: 30 }}
			style={{ maxWidth: 600 }}
			// initialValues={{ remember: true }}
			onFinish={onFinish}
			onFinishFailed={onFinishFailed}
			autoComplete="off"
		>
			<Form.Item<RegisterInfo>
				label="Name"
				name="name"
				rules={[
					{
						required: true,
						message: "Please input your name!",
					},
				]}
			>
				<Input />
			</Form.Item>

			<Form.Item<RegisterInfo>
				label="Email"
				name="email"
				rules={[
					{
						type: "email",
						required: true,
						message: "Please input your email!",
					},
				]}
			>
				<Input />
			</Form.Item>

			<Form.Item<RegisterInfo>
				label="Password"
				name="password"
				rules={[
					{ required: true, message: "Please input your password!" },
				]}
			>
				<Input.Password />
			</Form.Item>

			<Form.Item label={null}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	</Card>
);

export { Register };
